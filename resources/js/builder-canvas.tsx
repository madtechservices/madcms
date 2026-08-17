import { Columns3, LayoutPanelTop, Plus, Rows3 } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

import { columnWrapperClass, layoutNodeStyle, rowClass, sectionStyle } from './runtime';
import type { CmsRecord, ModulePlacement } from './types';

type CanvasColumn = CmsRecord & { id?: string; modules?: ModulePlacement[] };
type CanvasRow = CmsRecord & { id?: string; columns?: CanvasColumn[] };
type CanvasSection = CmsRecord & { id?: string; advanced_classes?: string; rows?: CanvasRow[] };

export type BuilderCanvasProps = {
    layout?: { sections?: CanvasSection[] } | null;
    selectedLayoutElementId?: string | null;
    editorEnabled?: boolean;
    renderPlacement: (placement: ModulePlacement, sectionIndex: number, rowIndex: number, columnIndex: number) => ReactNode;
    renderAction?: (label: string, icon: ReactNode, onClick: () => void) => ReactNode;
    onSelectLayoutElement?: (type: 'section' | 'row' | 'column', sectionIndex: number, rowIndex?: number, columnIndex?: number) => void;
    onDropModule?: (sectionIndex: number, rowIndex: number, columnIndex: number, moduleId: number) => void;
    onDropStarter?: (sectionIndex: number, rowIndex: number, columnIndex: number, starterId: string) => void;
    onMovePlacement?: (placementId: string, sectionIndex: number, rowIndex: number, columnIndex: number, beforePlacementId?: string) => void;
    onInsertSection?: (afterSectionIndex: number) => void;
    onAddRow?: (sectionIndex: number, widths?: string[]) => void;
    onAddColumn?: (sectionIndex: number, rowIndex: number) => void;
    onAddComponent?: (sectionIndex: number, rowIndex: number, columnIndex: number) => void;
};

function editorLayoutClass(selected: boolean, enabled: boolean) {
    if (!enabled) return undefined;

    return [
        'relative cursor-pointer outline outline-2 outline-offset-[-2px] transition',
        selected ? 'z-[1] outline-indigo-500' : 'outline-transparent hover:outline-indigo-200',
    ].join(' ');
}

function NativeCanvasAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            className="inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-indigo-200 bg-white px-2 text-[11px] font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClick();
            }}
        >
            {icon}
            {label}
        </button>
    );
}

export function BuilderCanvas({
    layout,
    selectedLayoutElementId = null,
    editorEnabled = false,
    renderPlacement,
    renderAction,
    onSelectLayoutElement,
    onDropModule,
    onDropStarter,
    onMovePlacement,
    onInsertSection,
    onAddRow,
    onAddColumn,
    onAddComponent,
}: BuilderCanvasProps) {
    const action = (label: string, icon: ReactNode, onClick: () => void) =>
        renderAction ? renderAction(label, icon, onClick) : <NativeCanvasAction label={label} icon={icon} onClick={onClick} />;

    if (!layout?.sections?.length) {
        if (!onInsertSection) return null;

        return (
            <div className="flex min-h-72 items-center justify-center border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-6">
                {action('Add first section', <LayoutPanelTop className="h-3.5 w-3.5" />, () => onInsertSection(-1))}
            </div>
        );
    }

    return (
        <>
            {onInsertSection && (
                <div className="flex items-center justify-center border-y border-dashed border-indigo-200 bg-indigo-50/40 py-1.5">
                    {action('Add section', <Plus className="h-3.5 w-3.5" />, () => onInsertSection(-1))}
                </div>
            )}
            {layout.sections.map((section, sectionIndex) => {
                const sectionSelected = selectedLayoutElementId === `section:${sectionIndex}`;

                return (
                    <Fragment key={section.id || sectionIndex}>
                        <div
                            style={sectionStyle(section)}
                            className={
                                [section.advanced_classes, editorLayoutClass(sectionSelected, !!onSelectLayoutElement)].filter(Boolean).join(' ') ||
                                undefined
                            }
                            data-builder-layout-id={`section:${sectionIndex}`}
                            onClick={
                                onSelectLayoutElement
                                    ? (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          onSelectLayoutElement('section', sectionIndex);
                                      }
                                    : undefined
                            }
                        >
                            {(section.rows || []).map((row, rowIndex) => {
                                const rowSelected = selectedLayoutElementId === `row:${sectionIndex}:${rowIndex}`;

                                return (
                                    <div
                                        key={row.id || rowIndex}
                                        className={
                                            [rowClass(row), editorLayoutClass(rowSelected, !!onSelectLayoutElement)].filter(Boolean).join(' ') ||
                                            undefined
                                        }
                                        style={layoutNodeStyle(row)}
                                        data-builder-layout-id={`row:${sectionIndex}:${rowIndex}`}
                                        onClick={
                                            onSelectLayoutElement
                                                ? (event) => {
                                                      event.preventDefault();
                                                      event.stopPropagation();
                                                      onSelectLayoutElement('row', sectionIndex, rowIndex);
                                                  }
                                                : undefined
                                        }
                                    >
                                        {(row.columns || []).map((column, columnIndex) => {
                                            const columnSelected = selectedLayoutElementId === `column:${sectionIndex}:${rowIndex}:${columnIndex}`;
                                            const columnEmpty = !(column.modules || []).length;

                                            return (
                                                <div
                                                    key={column.id || columnIndex}
                                                    className={
                                                        [
                                                            columnWrapperClass(column, (row.columns?.length || 0) > 1),
                                                            editorLayoutClass(columnSelected, !!onSelectLayoutElement),
                                                            onSelectLayoutElement && columnEmpty ? 'min-h-24 bg-blue-50/30' : undefined,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ') || undefined
                                                    }
                                                    style={layoutNodeStyle(column)}
                                                    data-builder-layout-id={`column:${sectionIndex}:${rowIndex}:${columnIndex}`}
                                                    onDragOver={
                                                        onDropModule || onDropStarter || onMovePlacement
                                                            ? (event) => {
                                                                  if (
                                                                      event.dataTransfer.types.includes('application/x-cms-module-id') ||
                                                                      event.dataTransfer.types.includes('application/x-cms-starter-id') ||
                                                                      (onMovePlacement &&
                                                                          event.dataTransfer.types.includes('application/x-cms-placement-id'))
                                                                  ) {
                                                                      event.preventDefault();
                                                                      event.dataTransfer.dropEffect = event.dataTransfer.types.includes(
                                                                          'application/x-cms-placement-id',
                                                                      )
                                                                          ? 'move'
                                                                          : 'copy';
                                                                  }
                                                              }
                                                            : undefined
                                                    }
                                                    onDrop={
                                                        onDropModule || onDropStarter || onMovePlacement
                                                            ? (event) => {
                                                                  const placementId = event.dataTransfer.getData('application/x-cms-placement-id');
                                                                  if (placementId && onMovePlacement) {
                                                                      event.preventDefault();
                                                                      event.stopPropagation();
                                                                      onMovePlacement(placementId, sectionIndex, rowIndex, columnIndex);
                                                                      return;
                                                                  }

                                                                  const starterId = event.dataTransfer.getData('application/x-cms-starter-id');
                                                                  if (starterId && onDropStarter) {
                                                                      event.preventDefault();
                                                                      event.stopPropagation();
                                                                      onDropStarter(sectionIndex, rowIndex, columnIndex, starterId);
                                                                      return;
                                                                  }

                                                                  const moduleId = Number(event.dataTransfer.getData('application/x-cms-module-id'));
                                                                  if (!moduleId || !onDropModule) return;
                                                                  event.preventDefault();
                                                                  event.stopPropagation();
                                                                  onDropModule(sectionIndex, rowIndex, columnIndex, moduleId);
                                                              }
                                                            : undefined
                                                    }
                                                    onClick={
                                                        onSelectLayoutElement
                                                            ? (event) => {
                                                                  event.preventDefault();
                                                                  event.stopPropagation();
                                                                  onSelectLayoutElement('column', sectionIndex, rowIndex, columnIndex);
                                                              }
                                                            : undefined
                                                    }
                                                >
                                                    {(column.modules || []).map((placement) => (
                                                        <Fragment key={placement.id}>
                                                            {renderPlacement(placement, sectionIndex, rowIndex, columnIndex)}
                                                        </Fragment>
                                                    ))}
                                                    {editorEnabled && columnEmpty && (
                                                        <div className="flex min-h-24 items-center justify-center border border-dashed border-blue-200 px-4">
                                                            {onAddComponent ? (
                                                                action('Add component', <Plus className="h-3.5 w-3.5" />, () =>
                                                                    onAddComponent(sectionIndex, rowIndex, columnIndex),
                                                                )
                                                            ) : (
                                                                <span className="text-center text-sm font-medium text-blue-700">Empty column</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {onAddComponent && columnSelected && !columnEmpty && (
                                                        <div className="flex justify-center border-t border-dashed border-indigo-200 bg-indigo-50/40 py-1.5">
                                                            {action('Add component', <Plus className="h-3.5 w-3.5" />, () =>
                                                                onAddComponent(sectionIndex, rowIndex, columnIndex),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {onAddColumn && rowSelected && (
                                            <div className="col-span-full flex justify-center border-t border-dashed border-indigo-200 bg-indigo-50/40 py-1.5">
                                                {action('Add column', <Columns3 className="h-3.5 w-3.5" />, () =>
                                                    onAddColumn(sectionIndex, rowIndex),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {onAddRow && sectionSelected && (
                                <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-dashed border-indigo-200 bg-indigo-50/40 py-2">
                                    {action('1 column', <Rows3 className="h-3.5 w-3.5" />, () => onAddRow(sectionIndex, ['full']))}
                                    {action('2 columns', <Columns3 className="h-3.5 w-3.5" />, () => onAddRow(sectionIndex, ['1/2', '1/2']))}
                                    {action('3 columns', <Columns3 className="h-3.5 w-3.5" />, () => onAddRow(sectionIndex, ['1/3', '1/3', '1/3']))}
                                </div>
                            )}
                        </div>
                        {onInsertSection && (
                            <div className="flex items-center justify-center border-y border-dashed border-indigo-200 bg-indigo-50/40 py-1.5">
                                {action('Add section', <Plus className="h-3.5 w-3.5" />, () => onInsertSection(sectionIndex))}
                            </div>
                        )}
                    </Fragment>
                );
            })}
        </>
    );
}
