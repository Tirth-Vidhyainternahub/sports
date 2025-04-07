const mongoose = require("mongoose");

const SportCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const SportCategory = mongoose.model("SportCategory", SportCategorySchema);
module.exports = SportCategory;