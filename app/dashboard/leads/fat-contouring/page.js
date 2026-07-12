'use client';
import LeadsTable from '@/components/LeadsTable';
import { FAT_CONTOURING_COLUMNS } from '@/lib/constants';

const DEFAULT_VISIBLE = FAT_CONTOURING_COLUMNS.map((c) => c.key);

export default function FatContouringLeadsPage() {
  return (
    <LeadsTable
      title="FAT Contouring Leads"
      subtitle="All leads captured for FAT Contouring."
      tableSlug="fat-contouring"
      columns={FAT_CONTOURING_COLUMNS}
      storageKey="leadsFatContouringColumns"
      defaultVisible={DEFAULT_VISIBLE}
    />
  );
}
