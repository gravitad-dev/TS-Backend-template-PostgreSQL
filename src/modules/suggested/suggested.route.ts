import { Router } from 'express';
import { suggestedController } from './suggested.controller';

const suggestedPrivateRouter = Router();
const suggestedPublicRouter = Router();


// PUBLICS ROUTES
suggestedPublicRouter.get('/', suggestedController.getAllSuggestions);
suggestedPublicRouter.get('/:id', suggestedController.getSuggestionById);

// PRIVATE ROUTES
suggestedPrivateRouter.post('/', suggestedController.createSuggestion);
suggestedPrivateRouter.put('/:id', suggestedController.updateSuggestion);
suggestedPrivateRouter.delete('/:id', suggestedController.deleteSuggestion);


export { suggestedPrivateRouter, suggestedPublicRouter };
