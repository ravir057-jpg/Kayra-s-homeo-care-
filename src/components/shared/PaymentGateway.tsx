import React, { useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  patientName: string;
}

export default function PaymentGateway({ amount, onSuccess, onCancel, patientName }: Props) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2); // Success step
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row shadow-2xl">
      {/* Left Panel: Summary */}
      <div className="w-full md:w-[450px] bg-emerald-900 p-8 md:p-12 text-white flex flex-col">
        <button onClick={onCancel} className="flex items-center gap-2 text-emerald-100/60 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="flex-1 space-y-12">
          <div className="space-y-4">
             <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-2">
                <Globe className="w-8 h-8 text-emerald-300" />
             </div>
             <h2 className="text-4xl font-bold tracking-tight">Checkout</h2>
             <p className="text-emerald-100/60 leading-relaxed font-light">Securely pay for your clinical consultation and homeopathic remedies at Kayra's Care.</p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Payment Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-100/60">Consultation Fee</span>
                  <span>₹250.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-100/60">Medicine Charges</span>
                  <span>₹{amount - 250 > 0 ? (amount - 250).toFixed(2) : "0.00"}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                   <p className="text-sm font-bold text-emerald-400 uppercase">Total Amount</p>
                   <p className="text-4xl font-black">₹{amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-emerald-100/40">
              <ShieldCheck className="w-4 h-4" />
              <span>PCI-DSS Compliant • SSL Encrypted Platform</span>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-12 border-t border-white/10 text-xs text-emerald-100/40 flex justify-between items-center">
          <p>© 2026 Kayra's Homeo Care</p>
          <div className="flex gap-4">
            <Lock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Right Panel: Interactive Flow */}
      <div className="flex-1 bg-gray-50 flex flex-col p-8 md:p-16 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="payment-methods"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto w-full space-y-12"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Select Payment Method</h3>
                <p className="text-gray-500">Choose how you'd like to pay securely.</p>
              </div>

              <div className="space-y-4">
                {[
                   { icon: CreditCard, title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay", tag: "Fast" },
                   { icon: Zap, title: "UPI Transfer", desc: "PhonePe, GPay, Paytm", tag: "Popular" },
                   { icon: Globe, title: "Net Banking", desc: "All Indian banks supported", tag: null },
                ].map((method, i) => (
                  <button 
                    key={i}
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:border-emerald-600 hover:shadow-xl hover:shadow-sage-900/5 transition-all text-left flex items-center justify-between group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-gray-100 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                        <method.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{method.title}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                    {method.tag && (
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {method.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {isProcessing && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-bold text-emerald-600 animate-pulse">Authenticating with your bank...</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-md mx-auto w-full text-center space-y-8 py-12"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-bold text-gray-900 tracking-tight">Payment Successful!</h3>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Thank you, {patientName}. Your payment of ₹{amount.toFixed(2)} has been processed successfully. 
                  A receipt has been sent to your registered mobile number.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono font-bold text-gray-900 uppercase">TXN-4892019302-K</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-400">Status</span>
                   <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Settled</span>
                </div>
              </div>

              <button 
                onClick={onSuccess}
                className="w-full bg-emerald-600 text-white font-bold py-5 rounded-[24px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
              >
                Return to Clinic Portal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
