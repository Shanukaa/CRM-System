'use client';
import LeadsTable from '@/components/LeadsTable';
import { BODY_FILLERS_COLUMNS } from '@/lib/constants';

const DEFAULT_VISIBLE = BODY_FILLERS_COLUMNS.map((c) => c.key);

export default function BodyFillersLeadsPage() {
  return (
    <LeadsTable
      title="Body Fillers Leads"
      subtitle="All leads captured for Body Fillers."
      tableSlug="body-fillers"
      columns={BODY_FILLERS_COLUMNS}
      storageKey="leadsBodyFillersColumns"
      defaultVisible={DEFAULT_VISIBLE}
    />
  );
}
