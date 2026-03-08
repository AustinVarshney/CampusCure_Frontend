import PageTransition from '@/components/animated/PageTransition';
import { Doubt } from '@/types';
import { getDoubtById, postAnswer, verifyAnswer, editAnswer } from '@/api/faculty';
import { 
  EyeOutlined, 
  LikeOutlined, 
  CheckCircleOutlined, 
  MessageOutlined, 
  ArrowLeftOutlined,
  SafetyOutlined,
  HistoryOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Button, Empty, Input, Tag, message, Spin, Card, Avatar, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const { TextArea } = Input;

const statusColors: Record<string, string> = { OPEN: 'orange', ANSWERED: 'blue', RESOLVED: 'green' };

const FacultyDoubtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [loading, setLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
    } catch (error) {
      message.error('Failed to fetch doubt details');
      navigate('/faculty/doubts');
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

  const handleVerifyAnswer = async (answerId: string) => {
    try {
      await verifyAnswer(answerId);
      message.success('Answer verified successfully!');
      fetchDoubt();
    } catch (error) {
      message.error('Failed to verify answer');
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/faculty/doubts')}>
          Back to Doubts
        </Button>

        <Card className="rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-foreground">{doubt.title}</h1>
            <Tag color={statusColors[doubt.status]}>{doubt.status}</Tag>
          </div>

          <p className="text-foreground whitespace-pre-wrap mb-4">{doubt.description}</p>

          <div className="flex gap-2 mb-4 flex-wrap">
            <Tag color="purple">{doubt.subject}</Tag>
            <Tag>Sem {doubt.semester}</Tag>
            {doubt.labels?.map((label) => (
              <Tag key={label} color="blue">{label}</Tag>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
            <span className="flex items-center gap-1"><EyeOutlined /> {doubt.views} views</span>
            <span className="flex items-center gap-1"><MessageOutlined /> {doubt.answerCount} answers</span>
            <span className="flex items-center gap-1"><LikeOutlined /> {doubt.upVoteCount} upvotes</span>
            <span>Posted by {doubt.postedBy.name || doubt.postedBy.username}</span>
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
                      <div className="space-y-3">
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
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-lg font-semibold">{answer.upVoteCount}</span>
                          {answer.isAccepted && (
                            <Tag color="green" icon={<CheckCircleOutlined />}>Accepted</Tag>
                          )}
                          {answer.isVerified && (
                            <Tag color="blue" icon={<SafetyOutlined />}>Verified</Tag>
                          )}
                          {!answer.isVerified && (
                            <Tooltip title="Verify this answer as faculty-approved">
                              <Button
                                icon={<SafetyOutlined />}
                                type="primary"
                                onClick={() => handleVerifyAnswer(answer.id)}
                                size="small"
                              >
                                Verify
                              </Button>
                            </Tooltip>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-foreground whitespace-pre-wrap mb-3">{answer.content}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <Avatar size="small">{(answer.answeredBy.name || answer.answeredBy.username || 'U')[0]}</Avatar>
                              <span className="font-medium">
                                {answer.answeredBy.name || answer.answeredBy.username}
                                {answer.answeredBy.role === 'FACULTY' && <Tag color="gold" className="ml-2">Faculty</Tag>}
                              </span>
                              <span>{formatDate(answer.createdAt)}</span>
                              {answer.editHistory && answer.editHistory.length > 0 && (
                                <Tooltip title={`Edited ${answer.editHistory.length} time(s)`}>
                                  <HistoryOutlined className="text-orange-500" />
                                </Tooltip>
                              )}
                            </div>
                            {isMyAnswer && (
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
            <Button type="primary" onClick={handlePostAnswer} loading={submitting} disabled={answerText.length < 10}>
              Post Answer
            </Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default FacultyDoubtDetail;
