import type { RegisterType } from "@/interfaces";
import { Form, Button, Input, Image } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { IoMailOutline, IoLockClosedOutline, IoPersonOutline, IoAirplane } from "react-icons/io5";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/auth/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState<string>("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const rawData = Object.fromEntries(new FormData(e.currentTarget));
    delete rawData.confirmPassword;

    const data = rawData as unknown as RegisterType;
    console.log("Register Data:", data);

    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/auth/login";
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex overflow-hidden bg-background">
      {/* Left Side: Image (Opposite of login for variety) */}
      <div className="hidden lg:block flex-1 relative overflow-hidden m-4 rounded-[3rem]">
        <Image
          src="/home/yeko/.gemini/antigravity/brain/9c6c0bb9-2c90-461c-a6bf-5d3ac464db36/login_side_image_1776790702942.png"
          alt="Register background"
          className="w-full h-full object-cover scale-x-[-1]"
          removeWrapper
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold italic mb-4">"The world is a book and those who do not travel read only one page."</h2>
            <p className="text-xl text-white/80 font-light">— Saint Augustine</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <IoAirplane size={24} className="-rotate-45" />
              </div>
              <p className="font-bold text-2xl italic">Travel<span className="text-primary not-italic">Sync</span></p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Account</h1>
            <p className="text-default-500">Join our community and start planning your next trip.</p>
          </div>

          <Form
            validationBehavior="native"
            onSubmit={onSubmit}
            className="flex flex-col gap-5 w-full"
          >
            <div className="flex gap-4 w-full">
              <Input
                name="firstName"
                label="First Name"
                labelPlacement="outside"
                placeholder="John"
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper: "h-12 rounded-xl",
                  label: "font-bold text-default-700",
                }}
              />
              <Input
                name="lastName"
                label="Last Name"
                labelPlacement="outside"
                placeholder="Doe"
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper: "h-12 rounded-xl",
                  label: "font-bold text-default-700",
                }}
              />
            </div>

            <Input
              name="username"
              label="Username"
              labelPlacement="outside"
              placeholder="johndoe123"
              variant="bordered"
              isRequired
              startContent={<IoPersonOutline size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-12 rounded-xl",
                label: "font-bold text-default-700",
              }}
            />

            <Input
              name="email"
              type="email"
              label="Email Address"
              labelPlacement="outside"
              placeholder="name@example.com"
              variant="bordered"
              isRequired
              startContent={<IoMailOutline size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-12 rounded-xl",
                label: "font-bold text-default-700",
              }}
            />

            <Input
              name="password"
              type="password"
              label="Password"
              labelPlacement="outside"
              placeholder="••••••••"
              variant="bordered"
              isRequired
              onValueChange={setPasswordValue}
              startContent={<IoLockClosedOutline size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-12 rounded-xl",
                label: "font-bold text-default-700",
              }}
            />

            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              labelPlacement="outside"
              placeholder="••••••••"
              variant="bordered"
              isRequired
              validate={(value) => (value !== passwordValue ? "Passwords do not match" : null)}
              startContent={<IoLockClosedOutline size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-12 rounded-xl",
                label: "font-bold text-default-700",
              }}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-default-500">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
