"use client";

import Link from "next/link";
import UniversalBulkActions from "@/components/admin/UniversalBulkActions";
import { servicesBulkConfig } from "@/lib/admin-configs";
import { useState } from "react";
import { useCsrfToken } from "@/hooks/use-csrf-token";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  active: number;
  order_index: number;
  created_at: string;
}

interface ServicesTableClientProps {
  services: Service[];
  deleteService: (formData: FormData) => Promise<void>;
}

export default function ServicesTableClient({
                                              services,
                                              deleteService,
                                            }: ServicesTableClientProps) {
  const [items, setItems] = useState<Service[]>(services);
  const { csrfToken } = useCsrfToken();

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor)
  );

  async function saveReorder(updated: Service[]) {
    try {
      const res = await fetch("/api/services/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken: csrfToken,
          items: updated.map((i) => ({
            id: i.id,
            order_index: i.order_index,
          })),
        }),
      });

      if (!res.ok) {
        console.log(res);
        throw new Error("Failed to reorder services");
      }
    } catch (err) {
      console.error("Error reordering services:", err);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order_index: index + 1,
    }));

    setItems(newItems);
    saveReorder(newItems);
  }

  if (!services || !Array.isArray(services) || services.length === 0) {
    return (
        <div className="py-12 text-center bg-white rounded-lg shadow">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg">
            <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No services yet
          </h3>
          <p className="mb-6 text-gray-500">
            Get started by creating your first service.
          </p>
          <Link
              href="/admin/services/new"
              className="inline-flex items-center px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
            Create Your First Service
          </Link>
        </div>
    );
  }

  return (
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <UniversalBulkActions items={services} config={servicesBulkConfig} />
        <div className="overflow-x-auto">
          <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
          >
            <SortableContext
                items={items.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                        type="checkbox"
                        id="select-all"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Service
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {items.map((service) => (
                    <SortableRow
                        key={service.id}
                        service={service}
                        deleteService={deleteService}
                    />
                ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </div>
  );
}

function SortableRow({
                       service,
                       deleteService,
                     }: {
  service: Service;
  deleteService: (formData: FormData) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
      <tr
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="hover:bg-gray-50 cursor-move"
      >
        <td className="px-6 py-4">
          <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded service-checkbox focus:ring-blue-500"
              data-id={service.id}
          />
        </td>
        <td className="px-6 py-4">
          <div className="max-w-xs">
            <div className="text-sm font-medium text-gray-900 truncate">
              {service.title}
            </div>
            <div className="mt-1 text-sm text-gray-500 truncate">
              {service.description}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
        <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                service.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
            }`}
        >
          {service.active ? "Active" : "Inactive"}
        </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span>#{service.order_index}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
          <div className="flex items-center justify-end space-x-3">
            <Link
                href={`/#services`}
                target="_blank"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                title="View Service"
            >
              <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View
            </Link>
            <Link
                href={`/admin/services/${service.id}/edit`}
                className="inline-flex items-center text-blue-600 hover:text-blue-900"
            >
              <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
            <form action={deleteService} className="inline">
              <input type="hidden" name="id" value={service.id} />
              <button
                  type="submit"
                  onClick={(e) => {
                    if (
                        !confirm("Are you sure you want to delete this service?")
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="inline-flex items-center text-red-600 hover:text-red-900"
                  title="Delete Service"
              >
                <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a2 2 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </form>
          </div>
        </td>
      </tr>
  );
}
