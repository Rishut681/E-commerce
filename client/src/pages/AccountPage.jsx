import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Mail, Phone, Edit, ShoppingCart, MapPin, Heart,
    Shield, LogOut, X, Loader2
} from "lucide-react";
import DashboardNavbar from "../components/DashboardNavbar";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";

// ---- Config ----
const API_BASE = import.meta.env?.VITE_API_BASE_URL || "https://e-commerce-44nm.onrender.com";

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const AccountWrapper = styled.div`
  flex: 1;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
`;

const Card = styled(motion.div)`
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  &:last-child { border-bottom: none; }
  strong { display: flex; align-items: center; gap: 8px; }
`;

const PrimaryButton = styled(motion.button)`
  background: linear-gradient(45deg, #6c63ff, #8e63ff);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  &:hover { transform: translateY(-2px); }
`;

const SecondaryButton = styled(motion.button)`
  background: linear-gradient(45deg, #6c63ff, #8e63ff);
  border: 1px solid #ddd;
  padding: 12px 20px;
  border-radius: 10px;
  margin-top: 20px;
  font-weight: 600;
  cursor: pointer;
`;

const Overlay = styled(motion.div)`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex; justify-content: center; align-items: center;
  z-index: 50;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 18px;
  padding: 30px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 10px 35px rgba(0,0,0,0.2);
  position: relative;
  h2 { text-align: center; margin-bottom: 20px; }
  form { display: flex; flex-direction: column; gap: 14px; }
  input {
    padding: 12px; border: 1px solid #ddd; border-radius: 10px;
    &:focus { border-color: #6c63ff; outline: none; }
  }
`;

const CloseButton = styled.button`
  position: absolute; top: 14px; right: 14px;
  border: none; background: transparent; cursor: pointer;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
`;

const DiscardButton = styled(SecondaryButton)`
  background: #f2f2f2;
  color: #333;
  &:hover { background: #e0e0e0; }
`;

const Loading = styled.div`
  display: flex; justify-content: center; align-items: center;
  gap: 10px;
  flex: 1; font-size: 1.2rem; color: #666;
  svg { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// --- Variants ---
const gridVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.6 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const AccountPage = () => {
    const { authToken, logout } = useAuth();

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

    // Change password modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });

    useEffect(() => {
        const fetchUserAndOrders = async () => {
            try {
                // --- Fetch profile ---
                const res = await fetch(`https://e-commerce-44nm.onrender.com/api/auth/user`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load user");

                // NOTE: API returns { userData }, not { user }
                const u = data.userData;
                setUser(u);
                setFormData({ name: u?.name || "", phone: u?.phone || "", address: u?.address || "" });

                // --- Fetch orders (optional if you have this route) ---
                const ordersRes = await fetch(`https://e-commerce-44nm.onrender.com/api/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const ordersData = await ordersRes.json();
                if (ordersRes.ok) setOrders(ordersData.orders || []);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (authToken) fetchUserAndOrders();
    }, [authToken]);

    const handleProfileChange = (e) =>
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            // Only send fields your backend updates
            const payload = {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
            };

            const res = await fetch(`https://e-commerce-44nm.onrender.com/api/auth/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");
            // Expecting { user: updatedUser }
            setUser(data.user);
            toast.success("Profile updated!");
            setShowEdit(false);
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Change password
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((p) => ({ ...p, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://e-commerce-44nm.onrender.com/api/auth/change-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(passwordData),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to change password");
            toast.success("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: "", newPassword: "" });
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <DashboardNavbar />
                <Loading><Loader2 /> Loading...</Loading>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <DashboardNavbar />
            <AccountWrapper>
                <Grid variants={gridVariants} initial="hidden" animate="visible">
                    {/* Profile */}
                    <Card variants={itemVariants}>
                        <CardHeader><User size={24} color="#6c63ff" /><h2>Profile Info</h2></CardHeader>
                        <InfoRow><strong><User size={16} /> Name</strong>{user?.name}</InfoRow>
                        <InfoRow><strong><Mail size={16} /> Email</strong>{user?.email}</InfoRow>
                        <InfoRow><strong><Phone size={16} /> Phone</strong>{user?.phone || "-"}</InfoRow>
                        <InfoRow><strong>Role</strong>{user?.role}</InfoRow>
                        <InfoRow><strong>Joined</strong>{new Date(user?.createdAt).toDateString()}</InfoRow>
                        <PrimaryButton onClick={() => setShowEdit(true)}><Edit size={16} /> Edit Profile</PrimaryButton>
                    </Card>

                    {/* Orders */}
                    <Card variants={itemVariants}>
                        <CardHeader><ShoppingCart size={24} color="#4caf50" /><h2>Recent Orders</h2></CardHeader>
                        {orders.length ? (
                            orders.slice(0, 3).map((o) => (
                                <InfoRow key={o._id}>
                                    <strong>{o._id}</strong>
                                    {o.status} – ${Number(o.total || 0).toFixed(2)}
                                </InfoRow>
                            ))
                        ) : (
                            <p>No orders yet.</p>
                        )}
                        <SecondaryButton onClick={() => (window.location.href = "/orders")}>
                            View All Orders
                        </SecondaryButton>
                    </Card>

                    {/* Address */}
                    <Card variants={itemVariants}>
                        <CardHeader><MapPin size={24} color="#ff7043" /><h2>Saved Addresses</h2></CardHeader>
                        <p>{user?.address || "No address saved"}</p>
                        <SecondaryButton onClick={() => (window.location.href = "/addresses")}>
                            Manage Addresses
                        </SecondaryButton>
                    </Card>

                    {/* Wishlist */}
                    <Card variants={itemVariants}>
                        <CardHeader><Heart size={24} color="#e91e63" /><h2>Wishlist</h2></CardHeader>
                        <p>You have 0 items in wishlist.</p>
                    </Card>

                    {/* Security */}
                    <Card variants={itemVariants}>
                        <CardHeader><Shield size={24} color="#2196f3" /><h2>Security</h2></CardHeader>
                        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
                            Keep your account secure by updating your password regularly.
                        </p>
                        <SecondaryButton onClick={() => setShowPasswordModal(true)}>
                            Change Password
                        </SecondaryButton>
                    </Card>

                    {/* Logout */}
                    <Card variants={itemVariants}>
                        <CardHeader><LogOut size={24} color="#f44336" /><h2>Logout</h2></CardHeader>
                        <PrimaryButton onClick={logout}>Logout</PrimaryButton>
                    </Card>
                </Grid>
            </AccountWrapper>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
                {showEdit && (
                    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Modal initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <CloseButton onClick={() => setShowEdit(false)}><X size={22} /></CloseButton>
                            <h2>Edit Profile</h2>
                            <form onSubmit={handleSaveProfile}>
                                <input name="name" placeholder="Name" value={formData.name} onChange={handleProfileChange} />
                                <input name="email" type="email" value={user?.email || ""} readOnly />
                                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleProfileChange} />
                                <input name="address" placeholder="Address" value={formData.address} onChange={handleProfileChange} />
                                <ModalActions>
                                    <DiscardButton type="button" onClick={() => setShowEdit(false)}>Discard</DiscardButton>
                                    <PrimaryButton type="submit">Save Changes</PrimaryButton>
                                </ModalActions>
                            </form>
                        </Modal>
                    </Overlay>
                )}
            </AnimatePresence>

            {/* CHANGE PASSWORD MODAL */}
            <AnimatePresence>
                {showPasswordModal && (
                    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Modal initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <CloseButton onClick={() => setShowPasswordModal(false)}><X size={22} /></CloseButton>
                            <h2>Change Password</h2>
                            <form onSubmit={handlePasswordSubmit}>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="Current password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="New password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <ModalActions>
                                    <DiscardButton type="button" onClick={() => setShowPasswordModal(false)}>Discard</DiscardButton>
                                    <PrimaryButton type="submit">Save Changes</PrimaryButton>
                                </ModalActions>
                            </form>
                        </Modal>
                    </Overlay>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};

export default AccountPage;
