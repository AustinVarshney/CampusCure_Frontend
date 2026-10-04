import { deleteAnswer as deleteStudentAnswer, deleteDoubt, editAnswer as editStudentAnswer, editDoubt, getDoubtById, markAnswerAsAccepted, postAnswer, upvoteAnswer, upvoteDoubt as upvoteStudentDoubt } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
import { Badge } from "@/components/app/PageShell";
import { DOUBT_STATUS } from "@/lib/statusStyles";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Doubt } from '@/types';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  LikeOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Input, message, Modal, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PostBody } from '@/components/content/PostBody';
import { TagChipList } from '@/components/tags/TagChip';
import { AttachmentUploader } from '@/components/attachments/AttachmentUploader';
import { AttachmentList } from '@/components/attachments/AttachmentList';
import { RichTextEditor, RICH_TEXT_FORMAT } from '@/components/content/RichTextEditor';
import { AuthorReputation } from '@/components/reputation/AuthorReputation';
import { plainTextLength } from '@/lib/codeBlocks';
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton';
import { withoutInlineImages } from '@/lib/inlineImages';

const { TextArea } = Input;

const approvalColors: Record<string, string> = { PENDING: 'gold', APPROVED: 'green', REJECTED: 'red' };

const DoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDoubt, setEditedDoubt] = useState({ title: '', description: '' });
  const [answerText, setAnswerText] = useState('');
  // CC-24: files are already in storage by the time this submits - the form
  // carries ids, never bytes.
  const [answerFiles, setAnswerFiles] = useState<string[]>([]);
  const [answerUploaderKey, setAnswerUploaderKey] = useState(0);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedAnswerText, setEditedAnswerText] = useState('');
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null);
  const [doubtUpvoteLoading, setDoubtUpvoteLoading] = useState(false);

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
      setEditedDoubt({ title: data.title, description: data.description });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to fetch doubt details');
      navigate('/student/doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (answerId: string) => {
    try {
      await upvoteAnswer(answerId);
      fetchDoubt(); // Refresh to update counts and upvote status
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to toggle upvote');
    }
  };

  const handleDoubtUpvote = async () => {
    if (!id) return;
    try {
      setDoubtUpvoteLoading(true);
      await upvoteStudentDoubt(id);
      await fetchDoubt();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to toggle doubt upvote');
    } finally {
      setDoubtUpvoteLoading(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!id) return;
    try {
      await markAnswerAsAccepted(id, answerId);
      fetchDoubt();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to toggle answer acceptance');
    }
  };

  const handlePostAnswer = async () => {
    if (!id) return;
    // CC-23: measure the writing, not the markup.
    if (plainTextLength(answerText) < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }

    try {
      setAnswerSubmitting(true);
      await postAnswer(id, answerText.trim(), answerFiles, RICH_TEXT_FORMAT);
      message.success('Answer submitted for faculty review');
      setAnswerText('');
      setAnswerFiles([]);
      setAnswerUploaderKey((k) => k + 1);
      fetchDoubt();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to submit answer');
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleEditMyAnswer = async (answerId: string) => {
    // CC-23: measure the writing, not the markup.
    if (plainTextLength(editedAnswerText) < 10) {
      message.warning('Answer must be at least 10 characters long');
      return;
    }

    try {
      setSavingAnswerId(answerId);
      await editStudentAnswer(answerId, editedAnswerText.trim());
      message.success('Answer updated successfully');
      setEditingAnswerId(null);
      setEditedAnswerText('');
      fetchDoubt();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to update answer');
    } finally {
      setSavingAnswerId(null);
    }
  };

  const handleDeleteMyAnswer = async (answerId: string) => {
    Modal.confirm({
      title: 'Delete Answer',
      content: 'Are you sure you want to delete this answer?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteStudentAnswer(answerId);
          message.success('Answer deleted successfully');
          fetchDoubt();
        } catch (error) {
          message.error(error instanceof Error ? error.message : 'Failed to delete answer');
        }
      },
    });
  };

  const handleEditDoubt = async () => {
    if (!id) return;
    if (!editedDoubt.title.trim() || plainTextLength(editedDoubt.description) === 0) {
      message.warning('Title and description are required');
      return;
    }

    try {
      await editDoubt(id, {
        title: editedDoubt.title,
        description: editedDoubt.description,
      });
      message.success('Doubt updated successfully');
      setEditMode(false);
      fetchDoubt();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to update doubt');
    }
  };

  const handleDeleteDoubt = async () => {
    if (!id) return;
    Modal.confirm({
      title: 'Delete Doubt',
      content: 'Are you sure you want to delete this doubt? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteDoubt(id);
          message.success('Doubt deleted successfully');
          navigate('/student/doubts');
        } catch (error) {
          message.error(error instanceof Error ? error.message : 'Failed to delete doubt');
        }
      },
    });
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

  const isDoubtOwner = doubt && user && doubt.postedBy.id === user.id;
  const canPostAnswer = Boolean(user?.approvalStatus === 'APPROVED');

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

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/student/doubts')}>
          Back to Community
        </Button>

        <Card className="rounded-2xl">
          {editMode ? (
            <div className="space-y-5 flex flex-col gap-2.5">
              <Input
                value={editedDoubt.title}
                onChange={(e) => setEditedDoubt({ ...editedDoubt, title: e.target.value })}
                placeholder="Doubt title"
                className="text-lg"
              />
              {/* CC-23: an HTML doubt is edited in the editor that wrote it. */}
              {doubt.descriptionFormat === 'HTML' ? (
                <RichTextEditor
                  value={editedDoubt.description}
                  onChange={(html) => setEditedDoubt((p) => ({ ...p, description: html }))}
                  placeholder="Doubt description"
                  imageEntity="DOUBT"
                />
              ) : (
                <TextArea
                  value={editedDoubt.description}
                  onChange={(e) => setEditedDoubt({ ...editedDoubt, description: e.target.value })}
                  rows={6}
                  placeholder="Doubt description"
                />
              )}
              <div className="flex gap-2">
                <Button type="primary" onClick={handleEditDoubt}>Save Changes</Button>
                <Button onClick={() => { setEditMode(false); setEditedDoubt({ title: doubt.title, description: doubt.description }); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
                <h1 className="text-2xl font-bold text-foreground wrap-break-word">{doubt.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={(DOUBT_STATUS[doubt.status] ?? DOUBT_STATUS.OPEN).tone}>{(DOUBT_STATUS[doubt.status] ?? DOUBT_STATUS.OPEN).label}</Badge>
                  {/* CC-21: private save. No count is shown, deliberately. */}
                  <BookmarkButton
                    doubtId={doubt.id}
                    bookmarked={Boolean(doubt.isBookmarkedByUser)}
                    showLabel
                    onChange={(next) =>
                      setDoubt((current) =>
                        current ? { ...current, isBookmarkedByUser: next } : current,
                      )
                    }
                  />
                  {isDoubtOwner && (
                    <>
                      <Button icon={<EditOutlined />} size="small" onClick={() => setEditMode(true)}>Edit</Button>
                      <Button icon={<DeleteOutlined />} size="small" danger onClick={handleDeleteDoubt}>Delete</Button>
                    </>
                  )}
                </div>
              </div>

              <PostBody content={doubt.description} format={doubt.descriptionFormat} className="mb-4" />

              {/* CC-24: empty and invisible while CC-02 is dormant. */}
              <AttachmentList
                attachments={withoutInlineImages(doubt.attachments, doubt.description)}
                className="mb-4"
              />

              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge tone="escalate">{doubt.subject}</Badge>
                <Tag>Sem {doubt.semester}</Tag>
                {/* CC-20: clicking a tag returns to the community filtered by it. */}
                <TagChipList
                  labels={doubt.labels}
                  labelsNormalized={doubt.labelsNormalized}
                  onTagClick={(tag) =>
                    navigate(`/student/doubts?tag=${encodeURIComponent(tag)}`)
                  }
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
            </>
          )}
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{sortedAnswers.length} Answer{sortedAnswers.length !== 1 ? 's' : ''}</h2>

          {sortedAnswers.length === 0 ? (
            <Empty description="No faculty answers yet" />
          ) : (
            sortedAnswers.map((answer, i) => {
              const isMyAnswer = Boolean(user && answer.answeredBy.id === user.id);
              const canEditMyPendingAnswer = isMyAnswer && answer.approvalStatus === 'PENDING';
              const canDeleteMyPendingAnswer = isMyAnswer && answer.approvalStatus === 'PENDING';
              const showRejectedNoteToOwner =
                answer.approvalStatus === 'REJECTED' &&
                isMyAnswer &&
                Boolean(answer.moderationNote);
              const showApprovedNoteToEveryone =
                answer.approvalStatus === 'APPROVED' &&
                Boolean(answer.moderationNote);

              return (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`rounded-xl ${answer.isAccepted ? 'border-green-500 border-2' : ''}`}>
                    {editingAnswerId === answer.id ? (
                      <div className="space-y-4">
                        {answer.contentFormat === 'HTML' ? (
                          <RichTextEditor
                            value={editedAnswerText}
                            onChange={setEditedAnswerText}
                            placeholder="Update your answer"
                            imageEntity="ANSWER"
                          />
                        ) : (
                          <TextArea
                            value={editedAnswerText}
                            onChange={(e) => setEditedAnswerText(e.target.value)}
                            rows={5}
                            placeholder="Update your answer"
                            maxLength={2000}
                            showCount
                          />
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="primary"
                            loading={savingAnswerId === answer.id}
                            onClick={() => handleEditMyAnswer(answer.id)}
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingAnswerId(null);
                              setEditedAnswerText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start w-full">
                          <PostBody content={answer.content} format={answer.contentFormat} />
                          <AttachmentList
                            attachments={withoutInlineImages(answer.attachments, answer.content)}
                          />
                          <Tooltip title="Upvote this answer">
                            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                              <Button
                                icon={<LikeOutlined />}
                                type={answer.isUpvotedByUser ? 'primary' : 'default'}
                                onClick={() => handleUpvote(answer.id)}
                                size="small"
                              />
                              <span className="text-base font-semibold">{answer.upvotes}</span>
                            </div>
                          </Tooltip>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                            <Avatar size="small">{(answer.answeredBy.name || answer.answeredBy.userID || 'U')[0]}</Avatar>
                            <span className="font-medium wrap-break-word">
                              {answer.answeredBy.name || answer.answeredBy.userID}
                              &nbsp;&nbsp;&nbsp;
                              {answer.answeredBy.role === 'FACULTY' && <Tag color="gold" className="ml-2">Faculty</Tag>}
                              {/* CC-25: reputation beside the author is where
                                  it helps a reader weigh the answer. */}
                              <AuthorReputation reputation={answer.answeredBy.reputation} />
                            </span>
                            <span>{formatDate(answer.createdAt)}</span>
                            {answer.editHistory && answer.editHistory.length > 0 && (
                              <Tooltip title={`Edited ${answer.editHistory.length} time(s)`}>
                                <HistoryOutlined className="text-orange-500" />
                              </Tooltip>
                            )}
                            {answer.isVerified && (
                              <Tag color="blue">Verified</Tag>
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
                          <div className='flex flex-wrap items-center gap-2'>
                            {canEditMyPendingAnswer && (
                              <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => {
                                  setEditingAnswerId(answer.id);
                                  setEditedAnswerText(answer.content);
                                }}
                              >
                                Edit
                              </Button>
                            )}
                            {canDeleteMyPendingAnswer && (
                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => handleDeleteMyAnswer(answer.id)}
                              >
                                Delete
                              </Button>
                            )}
                            {isDoubtOwner && (
                              <Tooltip title={answer.isAccepted ? "Unaccept this answer" : "Mark as accepted answer"}>
                                <Button
                                  icon={<CheckCircleOutlined />}
                                  type={answer.isAccepted ? 'primary' : 'default'}
                                  onClick={() => handleAcceptAnswer(answer.id)}
                                  size="small"
                                />
                              </Tooltip>
                            )}
                            {answer.isAccepted && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>Accepted</Tag>
                            )}
                          </div>
                        </div>
                        {showApprovedNoteToEveryone && (
                          <div className="rounded-lg bg-accent px-3 py-2 text-xs text-blue-800">
                            <span className="font-medium">Faculty Note:</span> {answer.moderationNote}
                          </div>
                        )}
                        {showRejectedNoteToOwner && (
                          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                            <span className="font-medium">Faculty Note:</span> {answer.moderationNote}
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

        {canPostAnswer && (
          <Card className="rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">Your Answer</h3>
            {/* CC-23: produces HTML; the SERVER sanitises it on write. */}
            <RichTextEditor
              value={answerText}
              onChange={setAnswerText}
              placeholder="Write your answer here…"
              disabled={answerSubmitting}
              imageEntity="ANSWER"
            />
            <div className="mt-3">
              <AttachmentUploader
                key={answerUploaderKey}
                entityType="ANSWER"
                onChange={setAnswerFiles}
                disabled={answerSubmitting}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button onClick={handlePostAnswer} loading={answerSubmitting} disabled={plainTextLength(answerText) < 10}>
                Submit for Review
              </Button>
              <span className="text-xs text-muted-foreground">
                Faculty will review this answer before it becomes public.
              </span>
            </div>
          </Card>
        )}

      </div>
    </PageTransition>
  );
};

export default DoubtDetail;