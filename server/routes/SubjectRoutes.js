import express from 'express';
import { createSubject, deleteSubject, getAllSubjectsInClass, getSubjectMarks, updateSubject } from '../controllers/SubjectController.js';
import { LoginValidator } from '../middlewares/LoggedIn.js';

const subjectRoutes = express.Router();

subjectRoutes.use(LoginValidator);
subjectRoutes.get('/:classId', getAllSubjectsInClass);
subjectRoutes.post('/:classId',createSubject);
subjectRoutes.get('/marks/:subId/:term', getSubjectMarks);
subjectRoutes.put('/:id', updateSubject);
subjectRoutes.delete('/:id', deleteSubject);




export default subjectRoutes;