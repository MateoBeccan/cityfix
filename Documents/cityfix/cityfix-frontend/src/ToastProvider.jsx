import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  const showToast = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-md text-white shadow-lg transition-all ${
            message.type === "error"
              ? "bg-red-500"
              : message.type === "success"
              ? "bg-green-500"
              : "bg-blue-500"
          }`}
        >
          {message.text}
        </div>
      )}
    </ToastContext.Provider>
  );
};
