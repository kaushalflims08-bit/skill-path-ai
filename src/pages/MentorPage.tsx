import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { selectActiveCareer, useAppStore } from '../store/useAppStore';
import { buildProficiencyMap } from '../lib/proficiency';
import { sendMentorMessage } from '../services/geminiClient';
import { MentorMessage, MentorMode, PreferredLanguage } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PathyMascot } from '../components/PathyMascot';

const MENTOR_MODES: MentorMode[] = [
  'Explain',
  'Socratic',
  'Debug my code',
  'Mock interviewer',
  'Study planner',
  'Motivation coach',
];

const QUICK_PROMPTS = [
  'Explain this topic simply',
  'Give me five practice questions',
  'What should I learn next?',
  'Explain my quiz mistakes',
  'Suggest a project',
  'Help me prepare for interviews',
];

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const parts = content.split(/(```[\s\S]*?```)/g);

  const handleCopy = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3);
          const firstNewline = inner.indexOf('\n');
          const lang = firstNewline > -1 ? inner.slice(0, firstNewline).trim() : '';
          const code = firstNewline > -1 ? inner.slice(firstNewline + 1) : inner;

          return (
            <div key={idx} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
              <div className="flex items-center justify-between bg-slate-800 px-3 py-1.5 text-[11px] text-slate-300">
                <span className="font-mono">{lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(code, idx)}
                  className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto p-3 text-xs text-slate-100 font-mono">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render bold text and line breaks cleanly without dangerouslySetInnerHTML
        const lines = part.split('\n');
        return (
          <div key={idx} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return null;
              const boldSegments = line.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={lIdx}>
                  {boldSegments.map((seg, sIdx) =>
                    seg.startsWith('**') && seg.endsWith('**') ? (
                      <strong key={sIdx} className="font-semibold">
                        {seg.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={sIdx}>{seg}</span>
                    ),
                  )}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const MentorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson') || '';

  const profile = useAppStore((s) => s.profile);
  const evidence = useAppStore((s) => s.evidence);
  const assessments = useAppStore((s) => s.assessments);
  const roadmapVersions = useAppStore((s) => s.roadmapVersions);
  const activeVersion = useAppStore((s) => s.activeRoadmapVersion);
  const mentorMessages = useAppStore((s) => s.mentorMessages);
  const addMentorMessage = useAppStore((s) => s.addMentorMessage);
  const rateMentorMessage = useAppStore((s) => s.rateMentorMessage);
  const clearMentorHistory = useAppStore((s) => s.clearMentorHistory);

  const [mode, setMode] = useState<MentorMode>('Explain');
  const [language, setLanguage] = useState<PreferredLanguage>(
    profile?.preferredLanguage ?? 'English',
  );
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string>(lessonParam);
  const [input, setInput] = useState(
    lessonParam ? `Explain "${lessonParam}" simply and give me a quick practice tip.` : '',
  );
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const lessons = useMemo(() => {
    const ver =
      roadmapVersions.find((v) => v.version === activeVersion) ??
      roadmapVersions[roadmapVersions.length - 1];
    return ver?.lessons ?? [];
  }, [roadmapVersions, activeVersion]);

  const selectedLesson = lessons.find((l) => l.title === selectedLessonTitle) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mentorMessages.length, streamingText]);

  const handleSend = async (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text || !profile || loading) return;

    const userMsg: MentorMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      mode,
      language,
      lessonTitle: selectedLesson?.title,
      source: 'offline',
      timestamp: new Date().toISOString(),
    };

    addMentorMessage(userMsg);
    if (!customText) setInput('');
    setLoading(true);

    const career = selectActiveCareer(profile);
    const proficiencies = buildProficiencyMap(
      career.requiredSkills.map((r) => r.skill),
      evidence,
      profile.selfReportedSkills,
    );

    const res = await sendMentorMessage({
      message: text,
      mode,
      language,
      profile,
      proficiencies,
      recentAssessments: assessments,
      lessonContext: selectedLesson,
      history: mentorMessages,
    });

    // Streaming-style reveal animation
    const words = res.reply.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i += 4) {
      current = words.slice(0, i + 4).join(' ');
      setStreamingText(current);
      await new Promise((r) => setTimeout(r, 18));
    }
    setStreamingText(null);

    const assistantMsg: MentorMessage = {
      id: `a_${Date.now()}`,
      role: 'assistant',
      content: res.reply,
      mode,
      language,
      lessonTitle: selectedLesson?.title,
      source: res.source,
      timestamp: new Date().toISOString(),
    };
    addMentorMessage(assistantMsg);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PathyMascot mood={loading ? 'thinking' : 'happy'} size="sm" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Pathy — AI Study Mentor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adapts to your weak topics, recent quiz mistakes, and study plan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as PreferredLanguage)}
              aria-label="Mentor language"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-medium"
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Tanglish">Tanglish</option>
            </select>

            <select
              value={selectedLessonTitle}
              onChange={(e) => setSelectedLessonTitle(e.target.value)}
              aria-label="Ask about this lesson"
              className="max-w-[210px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-medium truncate"
            >
              <option value="">General Career Context</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.title}>
                  Lesson: {l.title}
                </option>
              ))}
            </select>

            <Button size="sm" variant="ghost" onClick={clearMentorHistory}>
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* 6 Mentor Modes */}
        <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {MENTOR_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Viewport */}
      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="h-[420px] overflow-y-auto p-4 sm:p-6 space-y-4">
          {mentorMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && <PathyMascot mood="happy" size="sm" />}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Pathy · {msg.mode} · {msg.language}
                    </span>
                    <Badge tone={msg.source === 'gemini' ? 'blue' : 'neutral'}>
                      {msg.source === 'gemini' ? 'Live Gemini' : 'Offline mentor guidance'}
                    </Badge>
                  </div>
                )}

                <MarkdownMessage content={msg.content} />

                {msg.role === 'assistant' && (
                  <div className="mt-2 flex items-center gap-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70">
                    <button
                      type="button"
                      onClick={() => rateMentorMessage(msg.id, 'up')}
                      aria-label="Helpful response"
                      className={`rounded p-1 cursor-pointer ${
                        msg.feedback === 'up'
                          ? 'text-emerald-600'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rateMentorMessage(msg.id, 'down')}
                      aria-label="Needs improvement"
                      className={`rounded p-1 cursor-pointer ${
                        msg.feedback === 'down'
                          ? 'text-rose-600'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex gap-3 justify-start">
              <PathyMascot mood="thinking" size="sm" />
              <div className="max-w-[85%] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                <MarkdownMessage content={streamingText} />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick Prompts */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 px-4 py-2.5 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-400 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-slate-200 dark:border-slate-800 p-3 flex items-center gap-2 bg-white dark:bg-slate-900"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Pathy in ${language} (${mode} mode)...`}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <Button type="submit" loading={loading} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
        </form>
      </Card>
    </div>
  );
};
