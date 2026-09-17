import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, getUserByIdSchema } from '../schemas/user.schema';

const router = Router();

router.post('/', validateRequest(createUserSchema), UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', validateRequest(getUserByIdSchema), UserController.getUserById);

export const userRouter = router;
