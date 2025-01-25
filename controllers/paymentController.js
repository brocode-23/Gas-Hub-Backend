const paymentService = require("../services/paymentService");

const paymentController = {
  async save(req, res) {
    try {
      const payment = await paymentService.save(req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    console.log(req.body);
    try {
      const { token_code } = req.body;
      const updatedPayment = await paymentService.update(token_code, req.body);
      res.status(200).json(updatedPayment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const payments = await paymentService.getAll(req.query);
      res.status(200).json(payments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.body;
      await paymentService.delete(id);
      res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async fetchPaymentsByOutlet(req, res) {
    try {
      const userID = req.id;
      const payments = await paymentService.getAllPaymentsByOutlet(userID);
      console.log("Payments:", payments);
      res.status(200).json(payments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async fetchTotalPaymentsOfOutlets(req, res) {
    try {
      const totalPayments = await paymentService.getTotalPaymentsByOutlet();
      res.status(200).json(totalPayments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = paymentController;
