const Joi = require("joi");

var typeRegExp = "\\b(admin)\\b|\\b(teacher)|\\b(student)\\b";
var phoneRegEx = "^(\\+63)(9)(\\d{9})$|^(09)(\\d{9})$";
var lrnRegEx = "^([123456])(\\d{11})$";

var errorMessage = {
  INV_PHONE: "Invalid PH phone number",
  INV_LRN: "Invalid LRN number",
  TYPE_N_EXST: "Unrecognize type.",
};

const adminSchema = Joi.object({
  type: Joi.string()
    .regex(new RegExp(typeRegExp, "m"))
    .message(errorMessage.TYPE_N_EXST)
    .required(),
  firstName: Joi.string()
    .min(1)
    .message('"First name" is required.')
    .required(),
  midName: Joi.string()
    .min(1)
    .message('"Middle name" is not allowed to be empty.'),
  lastName: Joi.string()
  .min(1)
  .message('"Last name" is required.')
  .required(),
  phone: Joi.string()
    .regex(new RegExp(phoneRegEx, "m"))
    .message(errorMessage.INV_PHONE)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  isArchived: Joi.string()
    .min(4)
    .message('No admin status submitted.')
    .required(),
});

const teacherSchema = Joi.object({
  type: Joi.string().regex(new RegExp(typeRegExp, "m")).required(),
  firstName: Joi.string()
    .min(1)
    .message('"First name" is required.')
    .required(),
  midName: Joi.string()
    .min(1)
    .message('"Middle name" is not allowed to be empty.'),
  lastName: Joi.string()
  .min(1)
  .message('"Last name" is required.')
  .required(),
  phone: Joi.string()
    .regex(new RegExp(phoneRegEx, "m"))
    .message(errorMessage.INV_PHONE)
    .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  section: Joi.string()
  .min(1)
  .message('"Section" is not allowed to be empty."')
  .required(),
  isArchived: Joi.string()
  .min(4)
  .message('No teacher status submitted.')
  .required(),
});

const studentSchema = Joi.object({
  type: Joi.string().regex(new RegExp(typeRegExp, "m")).required(),
  firstName: Joi.string()
    .min(1)
    .message('"First name" is required.')
    .required(),
  midName: Joi.string()
    .min(1)
    .message('"Middle name" is not allowed to be empty.'),
  lastName: Joi.string()
  .min(1)
  .message('"Last name" is required.')
  .required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  idNum: Joi.string()
    .regex(new RegExp(lrnRegEx, "m"))
    .message(errorMessage.INV_LRN)
    .required(),
  isArchived: Joi.string()
  .min(4)
  .message('No student status submitted.')
  .required(),
  section: Joi.string()
  .min(1)
  .message('"Section" is not allowed to be empty."')
  .required(),
  schoolyear: Joi.string()
  .min(4)
  .message('"Invalid year.')
  .required(),
});

module.exports = { adminSchema, teacherSchema, studentSchema };
