const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded; // example: { userid: ..., email: ... }
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};
