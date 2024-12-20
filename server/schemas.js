const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// define joi extension to escape html, this is to prevent XSS attacks
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

// define the schema for user registration
module.exports.userSchema = Joi.object({
  firstName: Joi.string().required().escapeHTML(),
  lastName: Joi.string().required().escapeHTML(),
  email: Joi.string().email().required().escapeHTML(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.ref("password"),
});

// define the schema for meeting creation
module.exports.meetingSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  host: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  location: Joi.string().required().escapeHTML(),
  description: Joi.string().allow("").escapeHTML(),
  interval: Joi.number().required(),
  seatsPerSlot: Joi.number().required(),
  repeat: Joi.string().valid("None", "Daily", "Weekly").required(),
  endRepeatDate: Joi.date(),
  repeatDays: Joi.array().items(Joi.date()),
  
});

// define the schema for meeting slot creation
module.exports.meetingSlotSchema = Joi.object({
  occurrenceDate: Joi.date().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

// define the schema for booking a meeting slot
module.exports.bookingSchema = Joi.object({
  attendee: Joi.string().required().escapeHTML(),
  meetingID: Joi.string().required(),
  userID: Joi.string().allow(""),
  meetingDate: Joi.date().required(),
  timeSlot: Joi.string().required(),
  seats: Joi.number().required(),
});
