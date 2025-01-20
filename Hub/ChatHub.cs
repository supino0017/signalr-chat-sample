using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    public async Task SendMessage(string sender, string receiver, string message)
    {
        // Message Sending Log
        Console.WriteLine($"[SendMessage] {sender} -> {receiver}: {message}");
        
        // Send a message to the recipient only
        await Clients.Group(receiver).SendAsync("ReceiveMessage", sender, message);
    }

    public override async Task OnConnectedAsync()
    {
        var username = Context.GetHttpContext()?.Request.Query["username"];
        if (!string.IsNullOrEmpty(username))
        {
            // Add the user to a group
            Console.WriteLine($"[OnConnected] User connected: {username}");
            await Groups.AddToGroupAsync(Context.ConnectionId, username);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.GetHttpContext()?.Request.Query["username"];
        if (!string.IsNullOrEmpty(username))
        {
            // Remove the user from a group
            Console.WriteLine($"[OnDisconnected] User disconnected: {username}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, username);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
