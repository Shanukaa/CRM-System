'use client';
import LeadsTable from '@/components/LeadsTable';
import { BODY_FILLERS_COLUMNS, BODY_FILLERS_DEFAULT_VISIBLE, BODY_FILLERS_EDITABLE } from '@/lib/constants';

export default function BodyFillersLeadsPage() {
  return (
    <LeadsTable
      title="Body Fillers Leads"
      subtitle="All leads captured for Body Fillers."
      tableSlug="body-fillers"
      columns={BODY_FILLERS_COLUMNS}
      storageKey="leadsBodyFillersColumns"
      defaultVisible={BODY_FILLERS_DEFAULT_VISIBLE}
      editableColumns={BODY_FILLERS_EDITABLE}
    />
  );
}
