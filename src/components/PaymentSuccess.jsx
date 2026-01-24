import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [studentData, setStudentData] = useState(null);

    const razorpay_payment_id = searchParams.get("razorpay_payment_id");
    const razorpay_payment_link_id = searchParams.get("razorpay_payment_link_id");
    const razorpay_payment_link_reference_id = searchParams.get("razorpay_payment_link_reference_id");
    const razorpay_payment_link_status = searchParams.get("razorpay_payment_link_status");
    const razorpay_signature = searchParams.get("razorpay_signature");

    useEffect(() => {
        // Check if we have payment parameters from URL
        if (razorpay_payment_id && razorpay_payment_link_status === 'paid') {
            setMessage("Payment completed successfully! Your registration is now confirmed.");
            setStudentData({ paymentId: razorpay_payment_id });
            setLoading(false);
            
            // Redirect to login after 5 seconds
            setTimeout(() => {
                navigate("/");
            }, 5000);
        } else {
            setMessage("Invalid payment parameters or payment not completed.");
            setLoading(false);
        }
    }, [razorpay_payment_id, razorpay_payment_link_status, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '60px',
                    color: loading ? '#ffc107' : '#28a745',
                    marginBottom: '20px'
                }}>
                    {loading ? '⏳' : '✅'}
                </div>

                <h1 style={{ color: loading ? '#ffc107' : '#28a745', marginBottom: '20px' }}>
                    {loading ? 'Processing Payment' : 'Payment Successful'}
                </h1>

                {loading ? (
                    <div>
                        <p>Verifying your payment...</p>
                        <div style={{
                            margin: '20px auto',
                            width: '50px',
                            height: '50px',
                            border: '5px solid #f3f3f3',
                            borderTop: '5px solid #0d6efd',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                    </div>
                ) : (
                    <>
                        <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                            {message}
                        </p>

                        {studentData && (
                            <div style={{
                                backgroundColor: '#d4edda',
                                padding: '15px',
                                borderRadius: '5px',
                                marginBottom: '20px',
                                border: '1px solid #c3e6cb'
                            }}>
                                <p style={{ margin: '5px 0', color: '#155724' }}>
                                    <strong>Payment Confirmed!</strong>
                                </p>
                                <p style={{ margin: '5px 0', color: '#155724' }}>
                                    Your registration has been confirmed and payment status updated.
                                </p>
                            </div>
                        )}

                        {razorpay_payment_id && (
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '5px',
                                marginTop: '20px',
                                textAlign: 'left'
                            }}>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Transaction ID:</strong> {razorpay_payment_id}
                                </p>
                                {razorpay_payment_link_id && (
                                    <p style={{ margin: '5px 0' }}>
                                        <strong>Payment Link ID:</strong> {razorpay_payment_link_id}
                                    </p>
                                )}
                                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                                    Please save this transaction ID for your records.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => navigate("/")}
                            style={{
                                marginTop: '30px',
                                backgroundColor: '#0d6efd',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '5px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;