
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

const NoteDetail = () => (
  <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-8 text-[#F8FAFC]">
    <Card className="w-full max-w-4xl bg-[#161B22]/90 border border-[#2D3748] rounded-3xl shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#06B6D4]" />
          </div>

          <div>
            <CardTitle className="text-2xl font-black text-[#F8FAFC]">
              Note Details
            </CardTitle>

            <p className="text-sm text-[#94A3B8] mt-1">
              Full note content and metadata
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border border-[#2D3748] bg-[#0D1117]/70 p-6">
          <p className="text-[#94A3B8]">
            Full markdown note view, tags, subject, folder information,
            creation date and revision metadata will appear here.
          </p>
        </div>
      </CardContent>
    </Card>
  </main>
);

export default NoteDetail;