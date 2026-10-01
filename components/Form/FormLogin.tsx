'use client';

import { useForm } from "antd/es/form/Form";
import { Divider, Form, Input } from "antd";
import Button from "../common/Button";
import { useAppDispatch } from '../../redux/store';
import { login } from "../../redux/UserSlice";
import { useRouter } from "next/navigation";
import { userLoginAuth, UserAuthService } from "../../services/common";
import { useState } from "react";
import AlertMessage from "../common/FailedAlert";
import { useLoading } from "../../context/LoadingContext";
import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white w-full py-4 sm:px-10 max-w-md "
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Selamat Datang di
        </h2>
        <h1 className="text-orange-500 font-black text-4xl sm:text-5xl italic mt-1">
          AR Management
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          SiAR (Sistem Informasi AR) 🚀
        </p>
      </div>

      {errorMessage && <AlertMessage errorMessage={errorMessage} />}

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        className="p-2 space-y-4"
        onFinish={handleFinish}
      >
        <Form.Item
          label={<span className="font-medium text-gray-700">Email / Username</span>}
          name="email"
          rules={[{ required: true, message: "Isi email atau username Anda" }]}
        >
          <Input
            placeholder="Masukkan email atau username"
            className="rounded-lg py-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Password</span>}
          name="password"
          rules={[{ required: true, message: "Isi password Anda" }]}
        >
          <Input.Password
            placeholder="Masukkan password"
            className="rounded-lg py-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </Form.Item>

        {/* Buttons */}
        <div className="flex flex-col gap-3 my-4">
          <Button
            type="primary"
            color="orange-500"
            className="!w-full !py-3 !text-white !bg-orange-500 hover:!bg-orange-600 !font-semibold !rounded-xl transition"
            htmlType="submit"
          >
            Masuk
          </Button>

          <div className="flex items-center justify-center text-gray-400 text-sm">
            <Divider plain className="text-gray-400">atau</Divider>
          </div>

        </div>
        <div className="text-center mt-6 text-sm text-gray-600">
          <a href="/auth/forgot-password" className="text-orange-500 font-semibold hover:underline">
            Lupa Password?
          </a>
        </div>
        {/* <div className="text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <a href="/register" className="text-orange-500 font-semibold hover:underline">
            Daftar Sekarang
          </a>
        </div> */}
      </Form>
    </motion.div>
  );
};
