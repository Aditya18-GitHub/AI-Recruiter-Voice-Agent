import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";

import { RegisterForm } from "../../components/register-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center">
          <Image 
            src={"/logo.png"} 
            alt="logo" 
            width={200} 
            height={100} 
            className="w-[140px]" 
          />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
