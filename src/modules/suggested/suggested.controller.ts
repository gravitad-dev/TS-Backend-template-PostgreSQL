import { Request, Response,NextFunction } from 'express'
import { suggestedService } from './suggested.service'

export const suggestedController = {
    async getAllSuggestions(req: Request, res: Response) {  
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 5

            const paginatedSuggestions = await suggestedService.getAllSuggestions(page, limit)

            res.status(200).json(paginatedSuggestions)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching suggestions', error })
        }
    },

    async getSuggestionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params
            const { type } = req.query
    
            if (!type || (type !== 'articles' && type !== 'products')) {
                res.status(400).json({message: "Invalid type",})
            }
    
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 5
            
            const suggestions = await suggestedService.getSuggestionsById(Number(id), type as string, page, limit)
            
            if (!suggestions || suggestions.length === 0) {
                res.status(404).json({
                    message: 'Suggestions not found',
                })
            }
            
            if (type === 'articles') {
                res.status(200).json({
                    page,
                    limit,
                    articlesSuggested: suggestions
                })
            }else{
                res.status(200).json({
                    page,
                    limit,
                    productsSuggested: suggestions
                })
            }
        } catch (error) {
            next(error)
        }
    }
    ,

    async createSuggestion(req: Request, res: Response, next: NextFunction): Promise<void>   {
        try {
            const userId = req.user?.id

            if (!userId) {
                res.status(400).json({ message: 'User ID is missing in request' })
            }

            const suggestion = await suggestedService.createSuggested(userId)
            res.status(201).json(suggestion)
        } catch (error) {
            res.status(400).json(error)
            next(error)
        }
    },

    async updateSuggestion(req: Request, res: Response, next: NextFunction): Promise<void>  {
        const { id } = req.params
        const { type } = req.query
        const userId = req.user?.id

        if(!userId){
            res.status(404).json({message:"User not found"})
        }
    
        try {
          const result = await suggestedService.updateSuggestedEntity(userId, id, type as string)
    
          if (result.success) {
            res.status(200).json({ message: result.message })
          } else {
            res.status(Number(result.statusCode)).json({ message: result.message })
          }
        } catch (error) {
          next(error)
        }
      },

    async deleteSuggestion(req: Request, res: Response) {
        try {
        const id = Number(req.params.id)
        await suggestedService.deleteSuggested(id)
        res.json({ message: 'Suggestion deleted successfully' })
        } catch (error) {
        res.status(500).json({ message: 'Error deleting suggestion', error })
        }
    },
}
