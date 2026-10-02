import {
  approveAnswerDraft,
  deleteAnswer,
  editAnswer,
  generateAnswerDraft,
  getAnswerDraft,
  getDoubtById,
  moderateAnswer,
  postAnswer,
  rejectAnswerDraft,
  upvoteDoubt,
  type AnswerDraft,
} from '@/api/faculty';
import PageTransition from '@/components/animated/PageTransition';
import { Badge } from "@/components/app/PageShell";
import { DOUBT_STATUS } from "@/lib/statusStyles";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Doubt } from '@/types';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  LikeOutlined,
  MessageOutlined,
  RobotOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { Alert, Avatar, Button, Card, Empty, Input, message, Modal, Select, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PostBody } from '@/components/content/PostBody';
import { TagChipList } from '@/components/tags/TagChip';

const { TextArea } = Input;

const approvalColors: Record<string, string> = { PENDING: 'gold', APPROVED: 'green', REJECTED: 'red' };

const FacultyDoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isApproved = user?.approvalStatus === 'APPROVED';
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedAnswerText, setEditedAnswerText] = useState('');
  const [answerModerationModalOpen, setAnswerModerationModalOpen] = useState(false);
  const [answerModerationSubmitting, setAnswerModerationSubmitting] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [doubtUpvoteLoading, setDoubtUpvoteLoading] = useState(false);
  // CC-12: AI draft awaiting review. Null is the normal state, not an error.
  const [draft, setDraft] = useState<AnswerDraft | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftSourcesOpen, setDraftSourcesOpen] = useState(false);
  const [answerModerationForm, setAnswerModerationForm] = useState({
    approvalStatus: 'APPROVED' as 'APPROVED' | 'REJECTED',
    moderationNote: '',
  });

  useEffect(() => {
    if (id) {
      fetchDoubt();
    }
  }, [id]);

  const fetchDoubt = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getDoubtById(id);
      setDoubt(data);
    } catch (error) {
      message.error('Failed to fetch doubt details');
      navigate('/faculty/doubts');
    } finally {
      setLoading(false);
    }
  };

  /** CC-12: load any pending AI draft. Failure is silent — see getAnswerDraft. */
  const fetchDraft = async () => {
    if (!id) return;
    const found = await getAnswerDraft(id);
    setDraft(found);
    setDraftText(found?.content ?? '');
  };

  useEffect(() => {
    void fetchDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGenerateDraft = async () => {
    if (!id) return;
    try {
      setDraftBusy(true);
      const result = await generateAnswerDraft(id);
      if (result.created) {
        await fetchDraft();
        message.success('Draft generated');
      } else {
        // Usually "no grounding material found" — the feature working as
        // designed rather than a failure.
        message.info(result.reason ?? 'No draft could be generated for this doubt');
      }
    } finally {
      setDraftBusy(false);
    }
  };

  /**
   * Approve the draft. Sends whatever is on screen, so edits are preserved and
   * the backend can record whether the text was changed at all.
   */
  const handleApproveDraft = async () => {
    if (!id || draftText.trim().length < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }
    try {
      setDraftBusy(true);
      const result = await approveAnswerDraft(id, draftText);
      message.success(
        result.editedOnApproval
          ? 'Answer published with your edits'
          : 'Answer published',
      );
      setDraft(null);
      setDraftText('');
      fetchDoubt();
    } catch {
      message.error('Failed to publish the answer');
    } finally {
      setDraftBusy(false);
    }
  };

  const handleRejectDraft = async () => {
    if (!id) return;
    try {
      setDraftBusy(true);
      await rejectAnswerDraft(id);
      message.success('Draft rejected');
      setDraft(null);
      setDraftText('');
    } catch {
      message.error('Failed to reject the draft');
    } finally {
      setDraftBusy(false);
    }
  };

  const handlePostAnswer = async () => {
    if (!answerText.trim()) {
      message.warning('Please enter an answer');
      return;
    }
    if (answerText.length < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }
    if (!id) return;

    try {
      setSubmitting(true);
      await postAnswer(id, answerText);
      message.success('Answer posted successfully!');
      setAnswerText('');
      fetchDoubt(); // Refresh to show new answer
    } catch (error) {
      message.error('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAnswer = async (answerId: string) => {
    if (!editedAnswerText.trim() || editedAnswerText.length < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }

    try {
      await editAnswer(answerId, editedAnswerText);
      message.success('Answer updated successfully');
      setEditingAnswerId(null);
      setEditedAnswerText('');
      fetchDoubt();
    } catch (error) {
      message.error('Failed to update answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    Modal.confirm({
      title: 'Delete Answer',
      content: 'Are you sure you want to delete this answer? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteAnswer(answerId);
          message.success('Answer deleted successfully');
          fetchDoubt();
        } catch (error) {
          message.error('Failed to delete answer');
        }
      },
    });
  };

  const openAnswerModerationModal = (
    answerId: string,
    approvalStatus: 'APPROVED' | 'REJECTED',
    currentNote?: string | null,
  ) => {
    setSelectedAnswerId(answerId);
    setAnswerModerationForm({
      approvalStatus,
      moderationNote: currentNote || '',
    });
    setAnswerModerationModalOpen(true);
  };

  const handleModerateAnswer = async () => {
    if (!selectedAnswerId) return;

    try {
      setAnswerModerationSubmitting(true);
      await moderateAnswer(selectedAnswerId, {
        approvalStatus: answerModerationForm.approvalStatus,
        moderationNote: answerModerationForm.moderationNote.trim() || undefined,
      });
      message.success(
        answerModerationForm.approvalStatus === 'APPROVED'
          ? 'Answer approved successfully'
          : 'Answer rejected successfully',
      );
      setAnswerModerationModalOpen(false);
      setSelectedAnswerId(null);
      fetchDoubt();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to moderate answer');
    } finally {
      setAnswerModerationSubmitting(false);
    }
  };

  const handleDoubtUpvote = async () => {
    if (!id) return;
    try {
      setDoubtUpvoteLoading(true);
      await upvoteDoubt(id);
      await fetchDoubt();
    } catch (error) {
      message.error('Failed to toggle doubt upvote');
    } finally {
      setDoubtUpvoteLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Card className="rounded-2xl">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </Card>
          {Array.from({ length: 2 }).map((_, idx) => (
            <Card key={idx} className="rounded-xl">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      </PageTransition>
    );
  }

  if (!doubt) {
    return (
      <PageTransition>
        <Empty description="Doubt not found" />
      </PageTransition>
    );
  }

  const sortedAnswers = [...(doubt.answers || [])].sort((a, b) => {
    if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    return b.upvotes - a.upvotes;
  });
  const canPostAnswer = isApproved;

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/faculty/doubts')}>
          Back to Doubts
        </Button>

        <Card className="rounded-2xl">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
            <h1 className="text-2xl font-bold text-foreground wrap-break-word">{doubt.title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge tone={(DOUBT_STATUS[doubt.status] ?? DOUBT_STATUS.OPEN).tone}>{(DOUBT_STATUS[doubt.status] ?? DOUBT_STATUS.OPEN).label}</Badge>
            </div>
          </div>

          <PostBody content={doubt.description} format={doubt.descriptionFormat} className="mb-4" />

          <div className="flex gap-2 mb-4 flex-wrap">
            <Badge tone="escalate">{doubt.subject}</Badge>
            <Tag>Sem {doubt.semester}</Tag>
            <TagChipList
              labels={doubt.labels}
              labelsNormalized={doubt.labelsNormalized}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-4 border-t">
            <span className="flex items-center gap-1"><EyeOutlined /> {doubt.views} views</span>
            <span className="flex items-center gap-1"><MessageOutlined /> {doubt.answerCount} answers</span>
            <Tooltip title="Upvote this doubt">
              <Button
                icon={<LikeOutlined />}
                type={doubt.isUpvotedByUser ? 'primary' : 'default'}
                size="small"
                loading={doubtUpvoteLoading}
                onClick={handleDoubtUpvote}
                className="!px-2"
              >
                {doubt.upVoteCount}
              </Button>
            </Tooltip>
            <span>Posted by {doubt.postedBy.name || doubt.postedBy.userID}</span>
            <span>{formatDate(doubt.createdAt)}</span>
            {doubt.editHistory && doubt.editHistory.length > 0 && (
              <Tooltip title={`Edited ${doubt.editHistory.length} time(s)`}>
                <HistoryOutlined className="text-orange-500" />
              </Tooltip>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{sortedAnswers.length} Answer{sortedAnswers.length !== 1 ? 's' : ''}</h2>

          {sortedAnswers.length === 0 ? (
            <Empty description="No answers yet. Be the first to answer!" />
          ) : (
            sortedAnswers.map((answer, i) => {
              const isMyAnswer = user && answer.answeredBy.id === user.id;
              const isEditing = editingAnswerId === answer.id;

              return (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`rounded-xl ${answer.isAccepted ? 'border-green-500 border-2' : ''}`}>
                    {isEditing ? (
                      <div className="space-y-4 flex flex-col gap-2.5">
                        <TextArea
                          value={editedAnswerText}
                          onChange={(e) => setEditedAnswerText(e.target.value)}
                          rows={6}
                          placeholder="Edit your answer"
                        />
                        <div className="flex gap-2">
                          <Button type="primary" onClick={() => handleEditAnswer(answer.id)}>Save Changes</Button>
                          <Button onClick={() => {
                            setEditingAnswerId(null);
                            setEditedAnswerText('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                          <PostBody content={answer.content} format={answer.contentFormat} />
                          <div className="flex flex-wrap items-center justify-start gap-2 sm:flex-col sm:items-end sm:justify-start shrink-0">
                            {/* <span className="text-lg font-semibold">{answer.upvotes}</span> */}
                            {answer.isAccepted && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>Accepted</Tag>
                            )}
                            {/* Verify control removed from UI per request; verification logic unchanged on backend */}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                            <Avatar size="small">{(answer.answeredBy.name || answer.answeredBy.userID || 'U')[0]}</Avatar>
                            <span className="font-medium wrap-break-word">
                              {answer.answeredBy.name || answer.answeredBy.userID}
                              &nbsp;&nbsp;&nbsp;
                              {answer.answeredBy.role === 'FACULTY' && <Tag color="gold" className="ml-2">Faculty</Tag>}
                            </span>
                            <span>{formatDate(answer.createdAt)}</span>
                            {answer.editHistory && answer.editHistory.length > 0 && (
                              <Tooltip title={`Edited ${answer.editHistory.length} time(s)`}>
                                <HistoryOutlined className="text-orange-500" />
                              </Tooltip>
                            )}
                            {answer.isVerified && (
                              <Tag color="blue" icon={<SafetyOutlined />}>Verified</Tag>
                            )}
                            {answer.approvalStatus !== 'APPROVED' && (
                              <Tag color={approvalColors[answer.approvalStatus] || 'gold'}>
                                {answer.approvalStatus === 'PENDING' ? 'Pending Review' : 'Rejected'}
                              </Tag>
                            )}
                            {answer.moderatedBy && (
                              <span>
                                Moderated by {answer.moderatedBy.name || answer.moderatedBy.userID}
                                {answer.moderatedAt ? ` · ${formatDate(answer.moderatedAt)}` : ''}
                              </span>
                            )}
                          </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {answer.answeredBy.role !== 'FACULTY' && answer.approvalStatus === 'PENDING' && (
                                <>
                                  <Button size="small" type="primary" onClick={() => openAnswerModerationModal(answer.id, 'APPROVED', answer.moderationNote)}>
                                    Approve
                                  </Button>
                                  <Button size="small" danger onClick={() => openAnswerModerationModal(answer.id, 'REJECTED', answer.moderationNote)}>
                                    Reject
                                  </Button>
                                </>
                              )}
                              {answer.answeredBy.role !== 'FACULTY' &&
                                answer.approvalStatus !== 'PENDING' &&
                                answer.moderatedBy?.id === user?.id && (
                                <Button
                                  size="small"
                                  onClick={() =>
                                    openAnswerModerationModal(
                                      answer.id,
                                      answer.approvalStatus as 'APPROVED' | 'REJECTED',
                                      answer.moderationNote,
                                    )
                                  }
                                >
                                  Update Moderation
                                </Button>
                              )}
                              {isMyAnswer && (
                                <>
                                  <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    disabled={!isApproved}
                                    onClick={() => {
                                      setEditingAnswerId(answer.id);
                                      setEditedAnswerText(answer.content);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                    disabled={!isApproved}
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                        </div>
                        {answer.moderationNote && (
                          <div
                            className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                              answer.approvalStatus === 'REJECTED'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-accent text-blue-800'
                            }`}
                          >
                            <span className="font-medium">Moderation Note:</span> {answer.moderationNote}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* CC-12: AI-drafted answer awaiting review. Faculty only — students
            never see this, and nothing publishes until approved here. */}
        {draft && (
          <Card className="rounded-2xl border-amber-300 bg-amber-50/40">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RobotOutlined /> AI-drafted answer
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Written from {draft.sources.length} previously approved{' '}
                  {draft.sources.length === 1 ? 'answer' : 'answers'} on this
                  campus. Nothing is published until you approve it, and it will
                  be published under your name.
                </p>
              </div>
              <Tag color="orange">Not visible to students</Tag>
            </div>

            <Alert
              type="warning"
              showIcon
              className="rounded-xl mb-3"
              message="Please read this before approving"
              description="AI drafts can be confidently wrong. Approving publishes it as your answer, so read it as carefully as you would read a student's."
            />

            <TextArea
              rows={8}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              maxLength={4000}
              showCount
              disabled={!canPostAnswer || draftBusy}
            />

            {draft.sources.length > 0 && (
              <div className="mt-3">
                <Button
                  type="link"
                  size="small"
                  className="px-0"
                  onClick={() => setDraftSourcesOpen((open) => !open)}
                >
                  {draftSourcesOpen ? 'Hide' : 'Show'} the {draft.sources.length}{' '}
                  source {draft.sources.length === 1 ? 'answer' : 'answers'}
                </Button>
                {draftSourcesOpen && (
                  <div className="mt-2 space-y-2">
                    {draft.sources.map((source) => (
                      <div
                        key={source.answerId}
                        className="rounded-xl bg-white/70 border border-amber-200 p-3"
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          In reply to: {source.doubtTitle}
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {source.excerpt}…
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="primary"
                onClick={handleApproveDraft}
                loading={draftBusy}
                disabled={!canPostAnswer || draftText.trim().length < 10}
              >
                Publish as my answer
              </Button>
              <Button onClick={handleRejectDraft} disabled={draftBusy}>
                Reject draft
              </Button>
              <span className="text-xs text-muted-foreground self-center ml-1">
                {draft.model}
              </span>
            </div>
          </Card>
        )}

        <Card className="rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Your Answer</h3>
            {/* Offered only when there is no draft and no answer yet, so it
                cannot regenerate over a draft already under review. */}
            {!draft && canPostAnswer && (doubt.answers?.length ?? 0) === 0 && (
              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={handleGenerateDraft}
                loading={draftBusy}
              >
                Suggest a draft
              </Button>
            )}
          </div>
          {!isApproved && (
            <Alert
              type="warning"
              icon={<ClockCircleOutlined />}
              showIcon
              message="Account Pending Approval"
              description="Posting answers is disabled until your account is approved."
              className="rounded-xl"
            />
          )}
          <TextArea
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write your answer here (minimum 10 characters)..."
            maxLength={2000}
            showCount
            disabled={!canPostAnswer}
            className='mt-4'
          />
          <div className="mt-3">
            <Button onClick={handlePostAnswer} loading={submitting} disabled={answerText.length < 10 || !canPostAnswer}>
              Post Answer
            </Button>
          </div>
        </Card>

        <Modal
          open={answerModerationModalOpen}
          onCancel={() => {
            setAnswerModerationModalOpen(false);
            setSelectedAnswerId(null);
          }}
          title="Update Answer Moderation"
          onOk={handleModerateAnswer}
          okText="Update"
          okButtonProps={{ danger: answerModerationForm.approvalStatus === 'REJECTED' }}
          confirmLoading={answerModerationSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Decision</label>
              <Select
                className="w-full"
                value={answerModerationForm.approvalStatus}
                options={[
                  { label: 'Approve', value: 'APPROVED' },
                  { label: 'Reject', value: 'REJECTED' },
                ]}
                onChange={(value) =>
                  setAnswerModerationForm((prev) => ({
                    ...prev,
                    approvalStatus: value as 'APPROVED' | 'REJECTED',
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Moderation Note</label>
              <TextArea
                rows={3}
                value={answerModerationForm.moderationNote}
                onChange={(e) =>
                  setAnswerModerationForm((prev) => ({
                    ...prev,
                    moderationNote: e.target.value,
                  }))
                }
                placeholder="Optional note for the answer author"
              />
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default FacultyDoubtDetail;
