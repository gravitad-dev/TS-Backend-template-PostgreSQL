// import PDFDocument from 'pdfkit';

// import { Order, OrderProduct, User, Buyer, Product, Payment } from '@prisma/client';

// interface ExtendedOrder extends Order {
//   user: User;
//   buyer: Buyer;
//   orderProducts: Array<
//     OrderProduct & {
//       product: Product;
//     }
//   >;
//   payment: Payment | null;
// }

// export async function generateInvoicePDF(orderId: number): Promise<PDFKit.PDFDocument> {
//   try {

//     const doc = new PDFDocument({ margin: 50 });

//     // Header
//     doc.fontSize(20).text('FACTURA', { align: 'center' });
//     doc.moveDown();

//     // Company Info
//     doc.fontSize(10).text('Tu Empresa S.A.', { align: 'right' });
//     doc.text('Calle Ejemplo 123', { align: 'right' });
//     doc.text('Ciudad, País', { align: 'right' });
//     doc.text('info@tuempresa.com', { align: 'right' });
//     doc.moveDown();

//     // Invoice Details
//     doc.fontSize(12).text(`Factura #: ${order.id}`);
//     doc.text(`Fecha: ${order.createdAt.toLocaleDateString()}`);
//     doc.text(`Estado: ${order.status}`);
//     doc.moveDown();

//     // Customer Info
//     doc.fontSize(12).text('Información del Cliente:');
//     doc.fontSize(10).text(`Nombre: ${order.buyer.name}`);
//     doc.text(`Email: ${order.buyer.email || 'N/A'}`);
//     doc.text(`Dirección: ${order.buyer.addressBuyer || 'N/A'}`);
//     doc.text(`Teléfono: ${order.buyer.phoneNumber || 'N/A'}`);
//     doc.moveDown();

//     // Table Header
//     const tableTop = doc.y;
//     doc.font('Helvetica-Bold');
//     doc.text('Producto', 50, tableTop);
//     doc.text('Cantidad', 200, tableTop);
//     doc.text('Precio', 300, tableTop);
//     doc.text('Total', 400, tableTop);

//     // Table Rows
//     let y = tableTop + 25; // Start below the header
//     doc.font('Helvetica');
//     order.orderProducts.forEach((item) => {
//       doc.text(item.product.name, 50, y);
//       doc.text(item.quantity.toString(), 200, y);
//       doc.text(`$${item.product.regularPrice.toFixed(2)}`, 300, y);
//       doc.text(`$${(item.quantity * item.product.regularPrice).toFixed(2)}`, 400, y);
//       y += 25; // Move down for the next row
//     });

//     // Ensure there's space for totals
//     doc.moveDown(2); // Adds extra space before showing totals
//     doc.font('Helvetica-Bold');
//     doc.text(`Subtotal: $${order.totalAmount.toFixed(2)}`, { align: 'right' });
//     doc.text(`IVA (21%): $${(order.totalAmount * 0.21).toFixed(2)}`, { align: 'right' });
//     doc.text(`Total: $${(order.totalAmount * 1.21).toFixed(2)}`, { align: 'right' });

//     // Payment Info
//     doc.moveDown();
//     doc.fontSize(10).text('Información de Pago:');
//     doc.text(`Método de Pago: ${order.paymentType}`);
//     if (order.payment) {
//       doc.text(`ID de Transacción: ${order.payment.stripeId || order.payment.transactionHash || 'N/A'}`);
//       doc.text(`Estado del Pago: ${order.payment.status || 'N/A'}`);
//     }

//     // Footer
//     doc.fontSize(10).text('Gracias por su compra', 50, 700, { align: 'center', width: 500 });

//     // Finalize the PDF and end the stream
//     doc.end();

//     return doc;
//   } catch (error) {
//     console.error('Error generating invoice:', error);
//     throw error;
//   }
// }
