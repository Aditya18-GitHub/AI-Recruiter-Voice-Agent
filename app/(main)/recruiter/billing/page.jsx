"use client";

import { useState } from "react";
import { ArrowLeft, Coins, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/app/provider";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10,
    price: 29,
    pricePerCredit: 2.9,
    popular: false,
    features: [
      "10 Interview Credits",
      "Perfect for small teams",
      "Valid for 6 months",
      "Email support"
    ]
  },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 25,
    price: 59,
    pricePerCredit: 2.36,
    popular: true,
    features: [
      "25 Interview Credits",
      "Best value for money",
      "Valid for 12 months",
      "Priority email support",
      "Bulk interview creation"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 50,
    price: 99,
    pricePerCredit: 1.98,
    popular: false,
    features: [
      "50 Interview Credits",
      "Best price per credit",
      "Valid for 12 months",
      "Priority support",
      "Advanced analytics",
      "Custom integrations"
    ]
  }
];

export default function Billing() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default to professional
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, updateUserCredits } = useUser();

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Update user credits
      const currentCredits = user?.credits || 0;
      const newCredits = currentCredits + selectedPackage.credits;
      
      const result = await updateUserCredits(newCredits);
      
      if (result.success) {
        toast.success(`Successfully purchased ${selectedPackage.credits} credits! You now have ${newCredits} credits.`);
        
        setTimeout(() => {
          router.push('/recruiter/dashboard');
        }, 2000);
      } else {
        toast.error("Failed to update credits. Please try again.");
        console.error("Credit update error:", result.error);
      }
      
    } catch (error) {
      toast.error("Purchase failed. Please try again.");
      console.error("Purchase error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Purchase Interview Credits
            </h1>
            <p className="text-gray-600 mt-1">
              Buy credits to create AI-powered interviews
            </p>
          </div>
        </div>

        {/* Current Credits Display */}
        {user && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Current Credits</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {user.credits || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage.id === pkg.id 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Coins className="w-6 h-6 text-blue-600" />
                  {pkg.name}
                </CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  ${pkg.price}
                </div>
                <div className="text-sm text-gray-500">
                  ${pkg.pricePerCredit.toFixed(2)} per credit
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {pkg.credits}
                  </div>
                  <div className="text-sm text-gray-500">
                    Interview Credits
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Section */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Complete Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Selected Package:</span>
                <span className="text-blue-600 font-semibold">
                  {selectedPackage.name}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Credits:</span>
                <span className="text-blue-600 font-semibold">
                  {selectedPackage.credits} credits
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-bold">Total:</span>
                <span className="text-blue-600 font-bold text-lg">
                  ${selectedPackage.price}
                </span>
              </div>
              
              <Button 
                onClick={handlePurchase}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Purchase ${selectedPackage.credits} Credits`
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Credits are valid for 12 months from purchase date
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            How Credits Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">1 Credit = 1 Interview</h3>
              <p className="text-sm text-gray-600">
                Each interview creation costs exactly 1 credit
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Unlimited Candidates</h3>
              <p className="text-sm text-gray-600">
                One interview link can be shared with unlimited candidates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">12</span>
              </div>
              <h3 className="font-medium mb-2">12 Month Validity</h3>
              <p className="text-sm text-gray-600">
                Credits are valid for 12 months from purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}