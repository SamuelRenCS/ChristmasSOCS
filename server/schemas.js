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
