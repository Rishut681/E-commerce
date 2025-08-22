import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { useAuth } from "../store/auth";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";

const stripePromise = loadStripe("pk_test_51Rx4Tv2OUpPZogA8IBuXKC1TURVdL1XzayaRuLaYI62EE3E9A5Yjg8vpZFoycXJUaComtumhzACqO8IlWIbmzkKB00Qmuy0ZGF");

const Page = styled(motion.div)`
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
`;
const Main = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 30px;
  flex: 1;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 28px;
  display: grid;
  gap: 18px;
`;
const Title = styled.h1`
  margin: 0;
`;
const Button = styled.button`
  background: #6c63ff;
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
  box-shadow: 0 6px 15px rgba(108,99,255,.3);
  &:hover{ transform: translateY(-2px); }
  &:disabled{ opacity:.6; cursor:not-allowed; }
`;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
};

export default function CheckoutPage() {
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const onCheckout = useCallback(async () => {
    try {
      setLoading(true);
      const items = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
      if (!items.length) {
        toast.error("No items to checkout.");
        setLoading(false);
        return;
      }

      const res = await fetch(`https://e-commerce-44nm.onrender.com/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) throw error;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  return (
    <Page variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <DashboardNavbar />
      <Main>
        <Card>
          <Title>Checkout</Title>
          <p>When you click “Pay with Stripe”, you’ll be redirected to a secure Stripe Checkout page.</p>
          <Button onClick={onCheckout} disabled={loading}>
            {loading ? "Starting..." : "Pay with Stripe"}
          </Button>
        </Card>
      </Main>
      <Footer />
    </Page>
  );
}

