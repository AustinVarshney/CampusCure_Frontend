import { deleteAnswer, deleteDoubt, editAnswer, editDoubt, getDoubtById, markAnswerAsAccepted, postAnswer, upvoteAnswer } from '@/api/student';
import PageTransition from '@/components/animated/PageTransition';
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
import { Avatar, Button, Card, Empty, Input, message, Modal, Spin, Tag, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { TextArea } = Input;

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };

const DoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDoubt, setEditedDoubt] = useState({ title: '', description: '' });
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedAnswerText, setEditedAnswerText] = useState('');

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
      message.error('Failed to fetch doubt details');
      navigate('/student/doubts');
    } finally {
      setLoading(false);
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

  const handleUpvote = async (answerId: string) => {
    try {
      await upvoteAnswer(answerId);
      fetchDoubt(); // Refresh to update counts and upvote status
    } catch (error) {
      message.error('Failed to toggle upvote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!id) return;
    try {
      await markAnswerAsAccepted(id, answerId);
      fetchDoubt();
    } catch (error) {
      message.error('Failed to toggle answer acceptance');
    }
  };

  const handleEditDoubt = async () => {
    if (!id) return;
    if (!editedDoubt.title.trim() || !editedDoubt.description.trim()) {
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
      message.error('Failed to update doubt');
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
          message.error('Failed to delete doubt');
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

  if (loading) {
    return (
      <PageTransition>
        <div className="flex justify-center py-12">
          <Spin size="large" />
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
              <TextArea
                value={editedDoubt.description}
                onChange={(e) => setEditedDoubt({ ...editedDoubt, description: e.target.value })}
                rows={6}
                placeholder="Doubt description"
              />
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
                <h1 className="text-2xl font-bold text-foreground break-words">{doubt.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <Tag color={statusColors[doubt.status]}>{doubt.status}</Tag>
                  {isDoubtOwner && (
                    <>
                      <Button icon={<EditOutlined />} size="small" onClick={() => setEditMode(true)}>Edit</Button>
                      <Button icon={<DeleteOutlined />} size="small" danger onClick={handleDeleteDoubt}>Delete</Button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-foreground whitespace-pre-wrap mb-4">{doubt.description}</p>

              <div className="flex gap-2 mb-4 flex-wrap">
                <Tag color="purple">{doubt.subject}</Tag>
                <Tag>Sem {doubt.semester}</Tag>
                {doubt.labels?.map((label) => (
                  <Tag key={label} color="blue">{label}</Tag>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-4 border-t">
                <span className="flex items-center gap-1"><EyeOutlined /> {doubt.views} views</span>
                <span className="flex items-center gap-1"><MessageOutlined /> {doubt.answerCount} answers</span>
                <span>Posted by {doubt.postedBy.name || doubt.postedBy.username}</span>
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
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start w-full">
                          <p className="text-foreground whitespace-pre-wrap mb-0 break-words">{answer.content}</p>
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
                            <Avatar size="small">{(answer.answeredBy.name || answer.answeredBy.username || 'U')[0]}</Avatar>
                            <span className="font-medium break-words">
                              {answer.answeredBy.name || answer.answeredBy.username}
                              {answer.answeredBy.role === 'FACULTY' && <Tag color="gold" className="ml-2">Faculty</Tag>}
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
                          </div>
                          <div className='flex flex-wrap items-center gap-2'>
                            {isMyAnswer && (
                              <div className="flex flex-wrap items-center gap-2">
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
                                <Button
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  danger
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                >
                                  Delete
                                </Button>
                              </div>
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
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        <Card className="rounded-2xl">
          <h3 className="text-lg font-semibold mb-3">Your Answer</h3>
          <TextArea
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write your answer here (minimum 10 characters)..."
            maxLength={2000}
            showCount
          />
          <div className="mt-3">
            <Button onClick={handlePostAnswer} loading={submitting} disabled={answerText.length < 10}>
              Post Answer
            </Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default DoubtDetail;