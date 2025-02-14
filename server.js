import express from "express";
import dotenv from "dotenv";
import stripePackage from "stripe";

// Load Variables
dotenv.config();

// Start Server
const app = express();
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

app.use(express.static("public"));
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "public" });    
});

// Cart Route
app.get("/cart.html", (req, res) => {
    res.sendFile("cart.html", { root: "public" });    
});

// Success Route
app.get("/success.html", (req, res) => {
    res.sendFile("success.html", { root: "public" });    
});

// Cancel Route
app.get("/cancel.html", (req, res) => {
    res.sendFile("cancel.html", { root: "public" });    
});

// Stripe Checkout Endpoint
app.post("/stripe-checkout", async (req, res) => {
    try {
        // Validate request body
        if (!req.body || !Array.isArray(req.body.items)) {
            throw new Error("Invalid request body");
        }

        const lineItems = req.body.items.map((item) => {
            const unitAmount = parseInt(parseFloat(item.price) * 100);
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.title,
                        images: [item.image],
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `http://localhost:3000/success.html`,
            cancel_url: `http://localhost:3000/cancel.html`,
            billing_address_collection: "required",
            line_items: lineItems,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).json({ error: "Failed to create Stripe session" });
    }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
