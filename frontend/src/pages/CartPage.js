import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from 'axios'; // Import axios for API requests

// Utility function to format price in LKR
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(price);
};

const CartPage = () => {
    const [auth, setAuth] = useAuth();
    const [cart, setCart] = useCart();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [quantities, setQuantities] = useState({}); // For storing item quantities locally

    // Get all cart details when email changes
    useEffect(() => {
        const fetchCartDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8088/api/v1/cart/get-cart/${email}`);
                setCart(response.data.cart);
            } catch (error) {
                console.error('Error fetching cart details:', error);
            }
        };
        if (email) {
            fetchCartDetails();
        }
    }, [email]);

    // Fetch user information (email, username) from auth context
    useEffect(() => {
        if (auth && auth.user) {
            setEmail(auth.user.email); // Set email from auth context
            setUserName(auth.user.name); // Set userName from auth context
        }
    }, [auth]);

    // Handle delete cart item
    const handleDeleteCartItem = async (id, quantity, productID, cartQuantity) => {
        try {
            await axios.delete(`http://localhost:8088/api/v1/Cart/delete-cart-item/${id}`);
            setCart(cart.filter(item => item && item._id !== id));
            toast.success("Item deleted successfully");

            // Update product quantity in the database
            try {
                await axios.put(`http://localhost:8088/api/v1/product/update-product-quantity/${productID}`, {
                    quantity: quantity + cartQuantity,
                });
            } catch (error) {
                console.error('Error updating product quantity after deletion:', error);
            }
        } catch (error) {
            console.error('Error deleting cart item:', error);
        }
    };

    // Handle updating cart item quantity
    // Handle quantity change and update the backend (cart and product quantity)
const updateQuantity = async (id, type, currentQuantity, productID, productQuantity) => {
    let newQuantity;
    if (type === "increase" && currentQuantity < productQuantity) {
        newQuantity = currentQuantity + 1;
    } else if (type === "decrease" && currentQuantity > 1) {
        newQuantity = currentQuantity - 1;
    } else {
        return; // Exit if no valid update
    }

    // Update cart item quantity
    try {
        // Update quantity in the cart
        await axios.put(`http://localhost:8088/api/v1/Cart/update-item/${id}`, { quantity: newQuantity });
        setCart(cart.map(item => (item._id === id ? { ...item, quantity: newQuantity } : item)));

        // Update product stock in the database (increase or decrease based on the action)
        const stockChange = type === "increase" ? -1 : 1;
        await axios.put(`http://localhost:8088/api/v1/product/update-product-quantity/${productID}`, {
        quantity: productQuantity + stockChange, // Make sure you are correctly adjusting the stock
        });

        // Success notification and UI update
        toast.success("Quantity updated successfully");
    } catch (error) {
        console.error("Error updating item quantity or product stock:", error);
    }
};

// Total price calculation
const totalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * (quantities[item._id] || item.quantity), 0);
};

    // Handle quantity change
    // const updateQuantity = (id, type) => {
    //     const currentQuantity = quantities[id] || 1;
    //     if (type === "increase") {
    //         setQuantities(prev => ({ ...prev, [id]: currentQuantity + 1 }));
    //     } else if (type === "decrease" && currentQuantity > 1) {
    //         setQuantities(prev => ({ ...prev, [id]: currentQuantity - 1 }));
    //     }
    // };

    return (
        <Layout>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="text-center bg-light p-2 mb-1">
                            Hello {userName}
                        </h1>
                        <h4 className="text-center">
                            {cart?.length
                                ? `You have ${cart.length} item(s) in your cart ${auth?.token ? "" : "please login to checkout"}`
                                : "Your Cart is Empty"}
                        </h4>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        {cart?.map(p => (
                            <div className="row mb-2 p-3 card flex-row" key={p._id}>
                                <div className="col-md-4">
                                    <img 
                                        src={`http://localhost:8088/api/v1/product/product-photo/${p.product._id}`}
                                        className="card-img-top"
                                        alt={p.product.name}
                                        width="100px"
                                        height={"100px"}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <p>{p.product.name}</p>
                                    <p>Price: {formatPrice(p.product.price)}</p>
                                    <p><strong>Available: {p.product.quantity <= 0 ? "Out of Stock" : p.product.quantity}</strong></p>

                                    <div className="quantity-controls">
                                    <button 
                                     className="btn btn-secondary" 
                                     onClick={() => updateQuantity(p._id, "decrease", quantities[p._id] || p.quantity, p.product._id, p.product.quantity)}
                                     >−</button>
                                        <span className="quantity-box mx-2">
                                         {quantities[p._id] || p.quantity}
                                        </span>
                                        <button 
                                     className="btn btn-secondary" 
                                     onClick={() => updateQuantity(p._id, "increase", quantities[p._id] || p.quantity, p.product._id, p.product.quantity)}
                                     >+</button>
                                    </div>

                                    <button 
                                        className="btn btn-danger mt-2" 
                                        onClick={() => handleDeleteCartItem(p._id, p.product.quantity, p.product._id, p.quantity)}
                                    >Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-md-4 text-center">
                        <h2>Cart Summary</h2>
                        <p>Total | Checkout | Payment</p>
                        <hr/>
                        <h4>Total: {formatPrice(totalPrice())}</h4>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CartPage;
