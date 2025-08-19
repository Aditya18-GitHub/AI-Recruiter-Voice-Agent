"use client";
import Image from "next/image";
import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <Image 
            src={"/logo.png"} 
            alt="logo" 
            width={200} 
            height={100} 
            className="w-[140px]" 
          />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
