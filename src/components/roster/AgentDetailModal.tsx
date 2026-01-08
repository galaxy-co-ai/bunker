// ═══════════════════════════════════════════════════════════════
// BUNKER - Agent Detail Modal
// Detailed dossier view for AI Agents
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '../../lib/roster/types';

interface AgentDetailModalProps {
    agent: Agent;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (agent: Agent) => void;
}

type Tab = 'identity' | 'instructions' | 'assignment' | 'kpis';

export function AgentDetailModal({ agent: initialAgent, isOpen, onClose }: AgentDetailModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('identity');
    // Local state for "editing" (mock for now)
    const [agent] = useState(initialAgent);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="vault-panel w-full max-w-4xl h-[80vh] flex flex-col bg-background border-2 border-vault-yellow shadow-[0_0_50px_rgba(212,168,87,0.1)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black/30 border border-vault-yellow/30 flex items-center justify-center text-xl">
                            {agent.identity.avatar || '👤'}
                        </div>
                        <div>
                            <h2 className="heading-text text-xl text-vault-yellow tracking-widest">{agent.identity.codename}</h2>
                            <div className="font-mono text-xs text-text-muted">{agent.identity.title}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`
              px-3 py-1 text-xs font-mono border rounded uppercase
              ${agent.identity.status === 'active' ? 'border-safe text-safe bg-safe/10' : 'border-danger text-danger bg-danger/10'}
            `}>
                            {agent.identity.status}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-vault-yellow hover:bg-vault-yellow/10 rounded transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-black/20 border-b border-border-warning/30 px-6">
                    <TabButton active={activeTab === 'identity'} onClick={() => setActiveTab('identity')} label="IDENTITY" />
                    <TabButton active={activeTab === 'instructions'} onClick={() => setActiveTab('instructions')} label="INSTRUCTIONS" />
                    <TabButton active={activeTab === 'assignment'} onClick={() => setActiveTab('assignment')} label="ASSIGNMENT" />
                    <TabButton active={activeTab === 'kpis'} onClick={() => setActiveTab('kpis')} label="PERFORMANCE" />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-dots bg-[length:20px_20px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'identity' && <IdentityTab agent={agent} key="id" />}
                        {activeTab === 'instructions' && <InstructionsTab agent={agent} key="ins" />}
                        {activeTab === 'assignment' && <AssignmentTab agent={agent} key="ass" />}
                        {activeTab === 'kpis' && <KpisTab agent={agent} key="kpi" />}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border-warning/30 bg-concrete-dark/80 flex justify-between items-center text-[10px] font-mono text-text-muted">
                    <span>ID: {agent.identity.id}</span>
                    <span>LAST UPDATED: {agent.meta.created_at}</span>
                </div>
            </motion.div>
        </motion.div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
        px-6 py-3 text-xs font-mono tracking-wider transition-all relative
        ${active ? 'text-vault-yellow bg-vault-yellow/5' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}
      `}
        >
            {label}
            {active && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-vault-yellow" />}
        </button>
    );
}

// ─── Sub-Components ──────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <h3 className="text-xs font-mono text-vault-yellow/60 uppercase mb-3 border-b border-vault-yellow/10 pb-1">{title}</h3>
            {children}
        </section>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="mb-4">
            <div className="text-[10px] font-mono text-text-muted uppercase opacity-70 mb-1">{label}</div>
            <div className="text-sm font-mono text-text-secondary">{value}</div>
        </div>
    );
}

function IdentityTab({ agent }: { agent: Agent }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Section title="Basic Info">
                        <Field label="Full Codename" value={agent.identity.codename} />
                        <Field label="Role Title" value={agent.identity.title} />
                        <Field label="Agent ID" value={agent.identity.id} />
                    </Section>
                </div>
                <div>
                    <Section title="Version Control">
                        <Field label="Current Version" value={agent.meta.version} />
                        <Field label="Created By" value={agent.meta.created_by} />
                        <Field label="Date Created" value={agent.meta.created_at} />
                    </Section>
                </div>
            </div>
        </motion.div>
    );
}

function InstructionsTab({ agent }: { agent: Agent }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Section title="System Prompt">
                <div className="bg-black/40 border border-white/10 p-4 font-mono text-xs text-terminal-green/90 leading-relaxed whitespace-pre-wrap">
                    {agent.instructions.system_prompt}
                </div>
            </Section>

            <Section title="Decision Rules">
                <div className="space-y-2">
                    {agent.instructions.decision_rules.map((rule, i) => (
                        <div key={i} className="flex gap-4 p-2 bg-white/5 border border-white/5">
                            <div className="flex-1">
                                <div className="text-[9px] text-text-muted uppercase">IF</div>
                                <div className="text-xs text-caution">{rule.if}</div>
                            </div>
                            <div className="flex-1 pl-4 border-l border-white/10">
                                <div className="text-[9px] text-text-muted uppercase">THEN</div>
                                <div className="text-xs text-safe">{rule.then}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </motion.div>
    );
}

function AssignmentTab({ agent }: { agent: Agent }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Section title="Model Configuration">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Primary Model" value={agent.assignment.model_primary} />
                    <Field label="Fallback Models" value={agent.assignment.model_fallback.join(', ')} />
                </div>
            </Section>

            <Section title="Scope & Boundaries">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-[10px] font-mono text-text-muted mb-2">RESPONSIBILITIES</div>
                        <ul className="list-disc list-inside text-xs space-y-1 text-text-secondary">
                            {agent.scope.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                    <div>
                        <div className="text-[10px] font-mono text-text-muted mb-2">BOUNDARIES (DO NOT)</div>
                        <ul className="list-disc list-inside text-xs space-y-1 text-danger/80">
                            {agent.scope.boundaries.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                    </div>
                </div>
            </Section>
        </motion.div>
    );
}

function KpisTab({ agent }: { agent: Agent }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Section title="Performance Metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agent.kpis.metrics.map((metric) => (
                        <div key={metric.name} className="bg-black/30 border border-border-warning/30 p-4">
                            <div className="text-xs text-text-muted uppercase mb-2">{metric.name.replace(/_/g, ' ')}</div>
                            <div className="flex items-end gap-2">
                                <div className="text-2xl text-vault-yellow font-mono">{metric.current ?? '--'}</div>
                                <div className="text-[10px] text-text-muted mb-1">/ {metric.target} {metric.unit}</div>
                            </div>

                            {/* Mini Progress Bar */}
                            {metric.current !== undefined && (
                                <div className="h-1 bg-white/10 mt-3 overflow-hidden">
                                    <div
                                        className="h-full bg-vault-yellow"
                                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Section>
        </motion.div>
    );
}
