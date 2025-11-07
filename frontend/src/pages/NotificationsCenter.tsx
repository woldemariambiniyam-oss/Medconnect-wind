import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Button,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MarkAsUnread as MarkAsReadIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { showSuccessToast, showErrorToast } from '../components/NotificationToast';
import api from '../services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'payment' | 'system' | 'general';
  read: boolean;
  createdAt: string;
  data?: any;
}

const NotificationsCenter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error: any) {
      showErrorToast('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error: any) {
      showErrorToast('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      showSuccessToast('Notification deleted');
    } catch (error: any) {
      showErrorToast('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      showSuccessToast('All notifications marked as read');
    } catch (error: any) {
      showErrorToast('Failed to mark all notifications as read');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      showSuccessToast('All notifications cleared');
    } catch (error: any) {
      showErrorToast('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'prescription':
        return '💊';
      case 'payment':
        return '💳';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'primary';
      case 'prescription':
        return 'secondary';
      case 'payment':
        return 'success';
      case 'system':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" color="text.secondary">
          Please log in to view notifications.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Notifications
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<MarkAsReadIcon />}
                onClick={markAllAsRead}
                size="small"
              >
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<ClearAllIcon />}
                onClick={clearAllNotifications}
                size="small"
                color="error"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll receive notifications about appointments, prescriptions, and more here.
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" component="span">
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={getNotificationColor(notification.type) as any}
                            variant="outlined"
                          />
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                bgcolor: 'primary.main',
                                borderRadius: '50%',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {!notification.read && (
                        <IconButton
                          size="small"
                          onClick={() => markAsRead(notification._id)}
                          title="Mark as read"
                        >
                          <MarkAsReadIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => deleteNotification(notification._id)}
                        title="Delete notification"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default NotificationsCenter;
