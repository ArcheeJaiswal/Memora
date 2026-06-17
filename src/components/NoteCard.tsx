import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Edit,
  Trash2,
  Star,
  StarOff,
  Calendar,
  FileText,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  subject: string;
  createdAt: string;
  updatedAt: string;
  isMarkedForRevision: boolean;
  folderId?: string;
  type: "note" | "pdf";
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  viewMode: "grid" | "list";
  onEdit: (_id: string, noteData: Partial<Note>) => void;
  onDelete: (_id: string) => void;
  onToggleRevision: (_id: string) => void;
  onViewFull: (_id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folders,
  viewMode,
  onEdit,
  onDelete,
  onToggleRevision,
  onViewFull,
}) => {
  const folder = folders.find((f) => f._id === note.folderId);

  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const menu = (
    <DropdownMenuContent
      align="end"
      className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-xl shadow-2xl"
    >
      <DropdownMenuItem
        onClick={() => onViewFull(note._id)}
        className="focus:bg-[#7C3AED]/20 focus:text-white cursor-pointer"
      >
        <Eye className="w-4 h-4 mr-2 text-[#06B6D4]" />
        {note.type === "pdf" ? "View Full PDF" : "View Full Note"}
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => onEdit(note._id, {})}
        className="focus:bg-[#7C3AED]/20 focus:text-white cursor-pointer"
      >
        <Edit className="w-4 h-4 mr-2 text-[#A78BFA]" />
        Edit
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => onToggleRevision(note._id)}
        className="focus:bg-[#7C3AED]/20 focus:text-white cursor-pointer"
      >
        {note.isMarkedForRevision ? (
          <>
            <StarOff className="w-4 h-4 mr-2 text-[#06B6D4]" />
            Remove from Revision
          </>
        ) : (
          <>
            <Star className="w-4 h-4 mr-2 text-[#06B6D4]" />
            Mark for Revision
          </>
        )}
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => onDelete(note._id)}
        className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (viewMode === "list") {
    return (
      <Card className="bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl hover:border-[#7C3AED]/50 transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center">
                <FileText
                  className={`w-6 h-6 ${note.type === "pdf" ? "text-[#A78BFA]" : "text-[#06B6D4]"
                    }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold truncate text-[#F8FAFC]">
                    {note.title}
                  </h3>

                  {note.isMarkedForRevision && (
                    <Star className="w-4 h-4 text-[#06B6D4] fill-[#06B6D4]" />
                  )}
                </div>

                <p className="text-sm text-[#94A3B8] truncate">
                  {truncateContent(note.content, 100)}
                </p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {folder && (
                    <Badge className="text-xs bg-[#0D1117] text-[#94A3B8] border border-[#2D3748]">
                      <div className={`w-2 h-2 rounded-full ${folder.color} mr-1`} />
                      {folder.name}
                    </Badge>
                  )}

                  <Badge className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
                    {note.subject}
                  </Badge>

                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      className="text-xs bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-xs text-[#94A3B8] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {note.updatedAt}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#94A3B8] hover:text-white hover:bg-[#7C3AED]/10 rounded-xl"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                {menu}
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl hover:border-[#7C3AED]/50 transition-all group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center shrink-0">
              <FileText
                className={`w-5 h-5 ${note.type === "pdf" ? "text-[#A78BFA]" : "text-[#06B6D4]"
                  }`}
              />
            </div>

            <CardTitle className="text-sm font-bold text-[#F8FAFC] truncate">
              {note.title}
            </CardTitle>

            {note.isMarkedForRevision && (
              <Star className="w-4 h-4 text-[#06B6D4] fill-[#06B6D4] shrink-0" />
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8] hover:text-white hover:bg-[#7C3AED]/10 rounded-xl"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            {menu}
          </DropdownMenu>
        </div>

        {folder && (
          <div className="flex items-center gap-1 mt-2 text-xs text-[#94A3B8]">
            <div className={`w-2 h-2 rounded-full ${folder.color}`} />
            <span>{folder.name}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-[#94A3B8] mb-4 line-clamp-3">
          {truncateContent(note.content, 120)}
        </p>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
              {note.subject}
            </Badge>

            {note.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                className="text-xs bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30"
              >
                {tag}
              </Badge>
            ))}

            {note.tags.length > 2 && (
              <Badge className="text-xs bg-[#0D1117] text-[#94A3B8] border border-[#2D3748]">
                +{note.tags.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {note.updatedAt}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;