"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ServicesTableClient from "@/components/admin/ServicesTableClient";

interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  active: number;
  order_index: number;
  created_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services", {
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch services: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const servicesData = Array.isArray(data) ? data : data.items || [];
        setServices(servicesData);
      } catch (err) {
        console.error("[v0] Services fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete service");

      setServices(services.filter((service) => service.id !== id));
    } catch (err) {
      alert("Failed to delete service");
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="w-1/4 h-8 mb-4 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-4 mb-8 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">
            Manage your service offerings ({services.length} total)
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Service
        </Link>
      </div>

      <ServicesTableClient services={services} deleteService={handleDelete} />
    </div>
  );
}
