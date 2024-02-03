import React, { useMemo } from "react";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useGetProjectsQuery } from "../RTK_Query_app/services/project/projectApi";

export default function TableProjects() {
  const { data: projects, isLoading, error } = useGetProjectsQuery();

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
  ];

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log(projects);

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
      </table>
    </>
  );
}

{
  /**
<tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
*/
}
