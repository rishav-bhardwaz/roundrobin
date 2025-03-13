import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://roundrobin-933d.onrender.com";

function App() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/coupons`, { withCredentials: true })
      .then((res) => setCoupons(res.data))
      .catch(() => toast.error("Error fetching coupons"));
  }, []);

  const claimCoupon = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/coupons/claim`, {}, { withCredentials: true });
      toast.success(res.data.message);
      setCoupons((prev) => prev.filter((c) => c.code !== res.data.code));
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 text-white p-10">
      <motion.h1 
        className="text-4xl font-bold mb-5" 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Round-Robin Coupon System
      </motion.h1>

      <motion.div 
        className="bg-white text-blue-700 p-6 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Claim Your Coupon</h2>
        <button
          onClick={claimCoupon}
          disabled={loading}
          className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
        >
          {loading ? "Claiming..." : "Claim Coupon"}
        </button>
      </motion.div>

      <motion.div 
        className="mt-8 bg-white text-blue-700 p-6 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Available Coupons</h2>
        {coupons.length > 0 ? (
          <ul className="space-y-2">
            {coupons.map((coupon) => (
              <motion.li 
                key={coupon._id} 
                className="text-lg bg-blue-100 p-2 rounded-md shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                {coupon.code}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No coupons available</p>
        )}
      </motion.div>
      <ToastContainer />
    </div>
  );
}

export default App;
