import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Edit, Trash, Plus, X, Loader2 } from "lucide-react";
import DashboardNavbar from "../components/DashboardNavbar";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";

// --- Styled Components ---
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const AddressWrapper = styled.div`
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
  gap: 10px;
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
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
`;

const PrimaryButton = styled(motion.button)`
  background: linear-gradient(45deg, #6c63ff, #8e63ff);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  margin-top: 10px;
  cursor: pointer;
  &:hover { transform: translateY(-2px); }
`;

const SecondaryButton = styled(motion.button)`
  background: #f8f8f8;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f0f0f0; }
`;

const DangerButton = styled(SecondaryButton)`
  color: #f44336;
  border-color: #f44336;
  &:hover { background: #ffecec; }
`;

// --- Modal ---
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
  width: 500px;
  max-width: 95%;
  box-shadow: 0 10px 35px rgba(0,0,0,0.2);
  position: relative;
  h2 { text-align: center; margin-bottom: 20px; }
  form { display: flex; flex-direction: column; gap: 14px; }
  input, select {
    padding: 12px; border: 1px solid #ddd; border-radius: 10px;
    &:focus { border-color: #6c63ff; outline: none; }
  }
`;

const CloseButton = styled.button`
  position: absolute; top: 14px; right: 14px;
  border: none; background: transparent; cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const Loading = styled.div`
  display: flex; justify-content: center; align-items: center;
  flex: 1; font-size: 1.2rem; color: #666;
`;

// --- Variants ---
const gridVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.6 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// --- Component ---
const AddressPage = () => {
  const { authToken } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

  // Fetch all addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("https://e-commerce-44nm.onrender.com/api/address", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load addresses");
        setAddresses(data.addresses || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [authToken]);

  // Handle input change
  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Save address
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editId
        ? `https://e-commerce-44nm.onrender.com/api/address/${editId}`
        : `https://e-commerce-44nm.onrender.com/api/address`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");

      toast.success(editId ? "Address updated!" : "Address added!");
      setShowModal(false);
      setEditId(null);
      setFormData({});
      setAddresses((prev) =>
        editId ? prev.map((a) => (a._id === data.address._id ? data.address : a)) : [...prev, data.address]
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete address
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await fetch(`https://e-commerce-44nm.onrender.com/api/address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete address");

      toast.success("Address deleted!");
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loading><Loader2 className="spin" /> Loading...</Loading>;

  return (
    <PageContainer>
      <DashboardNavbar />
      <AddressWrapper>
        <Grid variants={gridVariants} initial="hidden" animate="visible">
          {addresses.map((addr) => (
            <Card key={addr._id} variants={itemVariants}>
              <CardHeader><MapPin size={24} color="#ff7043" /><h2>{addr.type}</h2></CardHeader>
              <InfoRow>{addr.addressLine1}</InfoRow>
              <InfoRow>{addr.addressLine2}</InfoRow>
              <InfoRow>{addr.city}, {addr.state}, {addr.country} - {addr.pincode}</InfoRow>
              <InfoRow>📞 {addr.mobile}</InfoRow>
              <ButtonRow>
                <SecondaryButton onClick={() => { setFormData(addr); setEditId(addr._id); setShowModal(true); }}>
                  <Edit size={16}/> Edit
                </SecondaryButton>
                <DangerButton onClick={() => handleDelete(addr._id)}>
                  <Trash size={16}/> Delete
                </DangerButton>
              </ButtonRow>
            </Card>
          ))}

          {/* Add New */}
          <Card variants={itemVariants} style={{ alignItems: "center", justifyContent: "center" }}>
            <PrimaryButton onClick={() => setShowModal(true)}><Plus size={18}/> Add New Address</PrimaryButton>
          </Card>
        </Grid>
      </AddressWrapper>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modal initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <CloseButton onClick={() => { setShowModal(false); setEditId(null); setFormData({}); }}>
                <X size={22} />
              </CloseButton>
              <h2>{editId ? "Edit Address" : "Add Address"}</h2>
              <form onSubmit={handleSave}>
                <input name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1 || ""} onChange={handleChange} required />
                <input name="addressLine2" placeholder="Address Line 2" value={formData.addressLine2 || ""} onChange={handleChange} />
                <input name="city" placeholder="City" value={formData.city || ""} onChange={handleChange} required />
                <input name="state" placeholder="State" value={formData.state || ""} onChange={handleChange} required />
                <input name="country" placeholder="Country" value={formData.country || ""} onChange={handleChange} required />
                <input name="pincode" placeholder="Pincode" value={formData.pincode || ""} onChange={handleChange} required />
                <input name="mobile" placeholder="Mobile No" value={formData.mobile || ""} onChange={handleChange} required />
                <select name="type" value={formData.type || ""} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
                <ButtonRow>
                  <SecondaryButton type="button" onClick={() => { setShowModal(false); setEditId(null); setFormData({}); }}>
                    Discard
                  </SecondaryButton>
                  <PrimaryButton type="submit">Save</PrimaryButton>
                </ButtonRow>
              </form>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default AddressPage;
