import ClassModel from "../models/ClassModel.js";
import MarksModel from "../models/MarksModel.js";
import SubjectModel from "../models/SubjectModel.js";
import UserModel from "../models/UserModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from 'bcryptjs';

// USER ACCOUNT CREATION
export const CreateTeacherAccount = async (req, res) => {
    const data = req.body;
    try {
        const isExist = await UserModel.findOne({ email: data.email });
        if (isExist) {
            throw Error('Email Already Exist !!');
        }

        const teacherData = {
            regNo: data.regNo,
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            dob: data.dob,
            password: data.password,
            email: data.email,
            gender: data.gender,
            role: 'teacher',
            contactNo: data.contactNo,
            parentId: null,
            classId: null,
            ownedClass: null

        }
        const result = await UserModel.create(teacherData);

        if (process.env.DEVELOPMENT == 'false') {
            console.log('Sending Email');
            sendEmail(data.email, "Account Created Successfully", { name: `Username : ${data.email}`, description: `Password: ${data.password}`, }, "./template/emailtemplate.handlebars");
        }

        res.status(200).json({
            message: 'Account Created Successfully!'
        })
    } catch (error) {
        console.log(error.message);
        res.status(401).json({ message: error.message });
    }

}

export const getAllTeachers = async (req, res) => {
    try {
        const result = await UserModel.find({ role: 'teacher' });

        const promises = result.map(async (teacher) => {
            const hisClass = await ClassModel.findOne({ ownedBy: teacher._id })

            if (hisClass) {
                return {
                    ...teacher._doc,
                    ownedClass: hisClass
                }
            } else {
                return { ...teacher._doc }
            }
        })
        const newTeachers = await Promise.all(promises)

        const promises2 = newTeachers.map(async (teacher) => {
            const hisSubjects = await SubjectModel.find({ teachBy: teacher._id });
            if (hisSubjects.length > 0) {

                return {
                    ...teacher,
                    ownedSubjects: hisSubjects
                }
            } else {
                return { ...teacher }

            }

        })

        const newTeachers2 = await Promise.all(promises2)




        // console.log(newTeachers);

        if (newTeachers2) {
            res.status(200).json(newTeachers2);
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getTeacher = async (req, res) => {
    const { email } = req.params;

    try {
        const result = await UserModel.findOne({ email });
        if (result) {
            res.status(200).json(result);
        } else {
            throw Error('Account not exist');
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
export const deleteTeacher = async (req, res) => {
    const { email } = req.params;

    try {
        const isExist = await UserModel.findOne({ email });
        if (!isExist) {
            console.log('Account not exist');
            throw Error('Account Not Exist')
        }
        const deleteSubjects = await SubjectModel.deleteMany({teachBy:isExist._id})
        const isDeleted = await UserModel.findOneAndDelete({ email });

        if (isDeleted) {
            res.status(200).json({
                message: 'Successfully Deleted'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const updateTeacher = async (req, res) => {
    const { email } = req.params;
    const data = req.body;

    const teacherData = {
        regNo: data.regNo,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        dob: data.dob,
        password: data.password,
        email: data.email,
        gender: data.gender,
        role: 'teacher',
        contactNo: data.contactNo,
        parentId: null,
        classId: null,
        ownedClass: null

    }

    try {
        const isExist = await UserModel.findOne({ email });
        if (!isExist) {
            res.status(500).json({
                message: 'Account Not Exist'
            });
        }
        const isUpdated = await UserModel.findOneAndUpdate({ email }, teacherData);

        if (isUpdated) {
            res.status(200).json({
                message: 'Successfully Updated'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

//Get My Subjects
export const getMySubjects = async (req, res) => {
    const { loggedInId } = req;
    if (!loggedInId) {
        res.status(401).json({ message: 'Please Log in to get Your Classes' });
    }
    try {
        console.log(loggedInId);
        const classes = await SubjectModel.find({ teachBy: loggedInId }).populate('classId');
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json(error.message);
    }
}

export const getStudentsInClass = async (req, res) => {
    const id = req.loggedInId
    try {
        const isClassExist = await ClassModel.findOne({ ownedBy: id });
        if (isClassExist) {
            try {
                const allStudents = await UserModel.find({ role: 'student', classId: isClassExist._id });
                if (!allStudents) {
                    throw Error('No Students Or Other Error');

                }
                res.status(200).json(allStudents);

            } catch (error) {
                res.status(500).json({
                    message: error.mesasge
                })
            }

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

export const teacherOverview = async (req, res) => {
    try {
        const id = req.loggedInId
        const teacherAcc = await UserModel.findById(id);

        const ownedClass = await ClassModel.findOne({ ownedBy: teacherAcc._id });

        //TODO: ADD MORE DATA TO TEACHER OVERVIEW
        if (ownedClass) {
            res.status(200).json({ className: ownedClass.grade + ' ' + ownedClass.subClass })
        } else {
            res.status(200).json({ className: 'Not Assigned' })
        }


    } catch (error) {
        res.status(500).json({ message: error.mesasge });
    }
}


export const getMyClassDetails = async(req,res)=>{
    try {
        const { loggedInId } = req;
        const myClass = await ClassModel.findOne({ownedBy:loggedInId});
        const allStudents = await UserModel.find({classId:myClass._id});
        const classModules = await SubjectModel.find({classId:myClass._id}).populate("teachBy")

        const marksPromises = classModules.map(async(sub,index)=>{
            const subject = await MarksModel.find({subId:sub?._id})
            return subject;
        })
        const allMarks = await Promise.all(marksPromises);

        res.status(200).json({
            myClass,
            classModules,
            allMarks,
            allStudents
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({mesasge:error.message})
    }
}