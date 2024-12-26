import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { removeAnsiCodes, extractDateFromLogLine } from '../../utils';

const router = express.Router();
const logsDirectory = path.join(__dirname);

// Function to get all log files of a specific type and sort them by modification date
const getAllLogFiles = (isErrorLog: boolean, order: 'asc' | 'desc') => {
  const files = fs
    .readdirSync(logsDirectory)
    .filter((file) => file.endsWith(isErrorLog ? 'error.log' : 'access.log')) // Filter by log type
    .sort((a, b) => {
      const fileA = fs.statSync(path.join(logsDirectory, a)).mtime.getTime();
      const fileB = fs.statSync(path.join(logsDirectory, b)).mtime.getTime();
      return order === 'asc' ? fileA - fileB : fileB - fileA; // Sort files based on 'order' parameter
    });
  return files;
};

// Common function to handle logs (both success and error logs)
const getLogs =
  (isErrorLog: boolean) => async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const order =
      (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc'; // Default order 'desc'

    try {
      const files = getAllLogFiles(isErrorLog, order); // Retrieve all log files sorted
      const logs = files.map((file) => {
        const filePath = path.join(logsDirectory, file);
        let logContent = fs
          .readFileSync(filePath, 'utf-8')
          .split('\n') // Split the content by lines
          .filter((line) => line.trim() !== '') // Remove empty lines
          .map(removeAnsiCodes); // Remove ANSI codes

        // Parse dates and associate each line with its date
        const logsWithDates = logContent.map((line) => {
          const date = extractDateFromLogLine(line);
          return { line, date };
        });

        // Filter lines where the date could not be extracted
        const validLogs = logsWithDates.filter((item) => item.date);

        // Sort logs based on the extracted date
        validLogs.sort((a, b) => {
          if (order === 'asc') {
            return a.date!.getTime() - b.date!.getTime();
          } else {
            return b.date!.getTime() - a.date!.getTime();
          }
        });

        // Extract sorted lines
        const sortedLogContent = validLogs.map((item) => item.line);

        const start = (page - 1) * limit;
        const paginatedContent = sortedLogContent.slice(start, start + limit);

        return {
          file,
          content: paginatedContent,
          totalLines: sortedLogContent.length, // Total valid lines in the log file
        };
      });

      res.json({
        logs,
        pagination: {
          page,
          limit,
          totalFiles: logs.length,
          order: order,
        },
      });
    } catch (error) {
      console.error(
        `Error reading ${isErrorLog ? 'error' : 'success'} logs:`,
        error
      );
      res.status(500).json({
        error: `Error reading ${isErrorLog ? 'error' : 'success'} logs`,
      });
    }
  };

// Route to get success logs
router.get('/success-logs', getLogs(false));

// Route to get error logs
router.get('/error-logs', getLogs(true));

export default router;
