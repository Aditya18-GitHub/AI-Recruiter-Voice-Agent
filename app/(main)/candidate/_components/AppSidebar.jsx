"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SideBarCondidate, SideBarOptions } from "@/services/Constants";
import { LogOutIcon, Plus } from "lucide-react";
import { UserAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  const { signOut } = UserAuth();

  return (
    <Sidebar>
      {/* Improved Logo Alignment */}
      <SidebarHeader className="flex items-center justify-center py-4 px-4">
        <Image
          src="/logo.png"
          alt=" Logo"
          width={120}
          height={120}
          className="w-[120px] object-contain"
          priority
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {SideBarCondidate.map((option, index) => (
              <SidebarMenuItem key={index} className="p-1">
                <SidebarMenuButton
                  asChild
                  className={`p-3 ${path === option.path && "bg-blue-50"
                    }`}
                >
                  <Link href={option.path} className="flex items-center gap-3">
                    <option.icon className="w-5 h-5" />
                    <span
                      className={`text-base font-medium ${path == option.path && "text-primary"
                        }`}
                    >
                      {option.name}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
      <Button
        className="px-5 cursor-pointer"
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
      >
        <LogOutIcon className="mr-2" />
        Logout
      </Button>


</SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;