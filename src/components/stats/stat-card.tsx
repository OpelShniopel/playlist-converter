import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "../ui/tooltip";

interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  tooltip?: string;
  loading?: boolean;
  expandable?: boolean;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
}

export function StatCard({
  icon,
  title,
  tooltip,
  loading,
  expandable,
  children,
  expandedContent,
}: Readonly<StatCardProps>) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-card p-6 rounded-lg border border-border transition-all duration-200 ${
        isExpanded ? "md:col-span-2 lg:col-span-3" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-primary">{icon}</div>
          <h3 className="font-medium">{title}</h3>
          {tooltip && (
            <Tooltip content={tooltip}>
              <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
            </Tooltip>
          )}
        </div>
        {expandable && expandedContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-2">
        {loading ? (
          <div className="animate-pulse bg-muted h-8 w-16 rounded" />
        ) : (
          <>
            <div>{children}</div>
            {isExpanded && expandedContent && (
              <div className="mt-4 pt-4 border-t border-border">
                {expandedContent}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
