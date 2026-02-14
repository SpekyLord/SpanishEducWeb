import Notification from '../models/Notification.js'

// Get notifications with pagination
export async function getNotifications(req, res) {
  try {
    const userId = req.user._id
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor._id', 'username displayName avatar')
        .lean(),
      Notification.countDocuments({ recipient: userId })
    ])

    // Update actor data with populated user data
    const notificationsWithCurrentUserData = notifications.map(notification => {
      const populatedActor = notification.actor?._id
      if (populatedActor && typeof populatedActor === 'object') {
        return {
          ...notification,
          actor: {
            _id: populatedActor._id,
            username: populatedActor.username,
            displayName: populatedActor.displayName,
            avatar: populatedActor.avatar?.url || null
          }
        }
      }
      return notification
    })

    res.json({
      success: true,
      data: {
        notifications: notificationsWithCurrentUserData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + notifications.length < total
        }
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications'
    })
  }
}

// Get unread notification count
export async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    })

    res.json({
      success: true,
      data: { count }
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    })
  }
}

// Mark single notification as read
export async function markAsRead(req, res) {
  try {
    const notificationId = req.params.id
    const userId = req.user._id

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    res.json({
      success: true,
      data: { notification }
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    })
  }
}

// Mark all notifications as read
export async function markAllAsRead(req, res) {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    })
  }
}

// Clear all notifications
export async function clearAllNotifications(req, res) {
  try {
    const result = await Notification.deleteMany({ recipient: req.user._id })

    res.json({
      success: true,
      message: 'All notifications cleared',
      data: { deletedCount: result.deletedCount }
    })
  } catch (error) {
    console.error('Clear all notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    })
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const notificationId = req.params.id
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: req.user._id
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    })
  }
}
