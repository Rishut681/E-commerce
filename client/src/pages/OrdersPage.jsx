import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import { useAuth } from "../store/auth";

const Page = styled(motion.div)`
  min-height: 100vh;
  background: #f0f2f5;
  display: flex; flex-direction: column;
`;
const Main = styled.div`
  max-width: 1000px; width: 100%;
  margin: 0 auto; padding: 30px; flex: 1;
`;
const Card = styled.div`
  background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
`;
const OrderRow = styled.div`
  padding: 14px 0; border-bottom: 1px solid #eee;
  &:last-child{ border-bottom: 0; }
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  .muted{ color:#666; font-size:.9rem; }
`;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
};

export default function OrdersPage() {
  const { authToken } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`https://e-commerce-44nm.onrender.com/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        console.error("Failed to load orders:", e);
      }
    })();
  }, [authToken]);

  return (
    <Page variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <DashboardNavbar />
      <Main>
        <Card>
          <h1>My Orders</h1>
          {orders.length === 0 ? (
            <p className="muted">You have no orders yet.</p>
          ) : (
            orders.map((o) => (
              <OrderRow key={o._id}>
                <div>
                  <div><strong>Order:</strong> {o._id}</div>
                  <div className="muted">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div><strong>${o.totalAmount?.toFixed(2)}</strong></div>
                <div className="muted">{o.status}</div>
              </OrderRow>
            ))
          )}
        </Card>
      </Main>
      <Footer />
    </Page>
  );
}
