'use client';
import LeadsTable from '@/components/LeadsTable';
import { FAT_CONTOURING_COLUMNS, FAT_CONTOURING_DEFAULT_VISIBLE, FAT_CONTOURING_EDITABLE } from '@/lib/constants';

export default function FatContouringLeadsPage() {
  return (
    <LeadsTable
      title="FAT Contouring Leads"
      subtitle="All leads captured for FAT Contouring."
      tableSlug="fat-contouring"
      columns={FAT_CONTOURING_COLUMNS}
      storageKey="leadsFatContouringColumns"
      defaultVisible={FAT_CONTOURING_DEFAULT_VISIBLE}
      editableColumns={FAT_CONTOURING_EDITABLE}
    />
  );
}
