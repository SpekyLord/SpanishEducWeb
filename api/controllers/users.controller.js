// Users controller - To be fully implemented in Phase 2
import User from '../models/User.js';

export async function searchUsers(req, res) {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.length < 1) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username displayName avatar.url')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      users: users.map(u => ({
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatar?.url
      }))
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ success: false, message: 'Search error' });
  }
}

export async function getUserProfile(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function updateProfile(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function uploadAvatar(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function deleteAvatar(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function changePassword(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function getBookmarks(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function deactivateAccount(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function getAllStudents(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}

export async function getAnalytics(req, res) {
  res.status(501).json({ error: 'Not implemented yet' })
}
