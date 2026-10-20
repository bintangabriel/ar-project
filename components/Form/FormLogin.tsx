'use client';

import { useForm } from "antd/es/form/Form";
import { Form, Input } from "antd";
import Button from "../common/Button";
import { useAppDispatch } from '../../redux/store';
import { login } from "../../redux/UserSlice";
import { useRouter } from "next/navigation";
import { userLoginAuth, UserAuthService } from "../../services/common";
import { useState } from "react";
import AlertMessage from "../common/FailedAlert";
import { useLoading } from "../../context/LoadingContext";
import { motion } from "framer-motion";

const inputClass =
  "!rounded-lg !border-slate-300 hover:!border-[#AEC4D4] focus:!border-[#0F2D6B] focus-within:!border-[#0F2D6B] focus:!shadow-[0_0_0_3px_rgba(174,196,212,0.5)] focus-within:!shadow-[0_0_0_3px_rgba(174,196,212,0.5)]";

export const FormLogin = () => {
  const { setLoading } = useLoading();
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinish = async (values: userLoginAuth) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await new Promise(resolve =>
        requestAnimationFrame(() => setTimeout(resolve, 0))
      );

      const userResponse = await UserAuthService.loginEmail(values);
      document.cookie = `token=${userResponse.jwt.token}; path=/; secure; samesite=strict`;
      dispatch(login(userResponse));

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan. Coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-sm"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#5B86A3]">
          ARISE
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0F2D6B]">
          Masuk ke akun Anda
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Silakan masukkan kredensial Anda untuk melanjutkan.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4">
          <AlertMessage errorMessage={errorMessage} />
        </div>
      )}

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
      >
        <Form.Item
          label={<span className="text-sm font-medium text-slate-700">Email / Username</span>}
          name="email"
          rules={[{ required: true, message: "Isi email atau username Anda" }]}
        >
          <Input
            size="large"
            placeholder="Masukkan email atau username"
            className={inputClass}
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-sm font-medium text-slate-700">Password</span>}
          name="password"
          rules={[{ required: true, message: "Isi password Anda" }]}
        >
          <Input.Password
            size="large"
            placeholder="Masukkan password"
            className={inputClass}
          />
        </Form.Item>

        {/* Buttons */}
        <div className="mt-6">
          <Button
            type="primary"
            color="orange-500"
            className="!w-full !h-12 !text-white !bg-[#0F2D6B] hover:!bg-[#0B2250] !font-semibold !rounded-lg !shadow-md !shadow-[#0F2D6B]/20 transition"
            htmlType="submit"
          >
            Masuk
          </Button>
        </div>

        {/* <div className="text-center mt-6 text-sm text-gray-600">
          <a href="/auth/forgot-password" className="text-[#0F2D6B] font-semibold hover:underline">
            Lupa Password?
          </a>
        </div> */}
        {/* <div className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-[#0F2D6B] font-semibold hover:underline">
            Daftar Sekarang
          </a>
        </div> */}
      </Form>
    </motion.div>
  );
};