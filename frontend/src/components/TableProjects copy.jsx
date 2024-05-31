import React, { useMemo, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useGetProjectsQuery } from "../RTK_Query_app/services/project/projectApi";

export default function TableProjects() {
  const { data: projects, isLoading, error } = useGetProjectsQuery();

  console.log(projects, "af");

  const columns = [
    {
      header: "PROJECT ID",
      accessorKey: "ccn_project",
    },
    {
      header: "PROJECT TITLE",
      accessorKey: "title_project",
    },
    {
      header: "PROJECT DESCRIPTION",
      accessorKey: "description_project",
    },
    {
      header: "SOFTWARE REQUIREMENT",
      accessorKey: "pdf_software_requirement",
    },
    {
      header: "ER MODEL",
      accessorKey: "image_entity_relationship",
    },
  ];

  const table = useReactTable({
    data: projects,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.ccn_project}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.ccn_project}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
