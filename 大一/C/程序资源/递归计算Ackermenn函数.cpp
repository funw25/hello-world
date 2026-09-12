//int Ack( int m, int n );
//其中m和n是用户传入的非负整数。函数Ack返回Ackermenn函数的相应值。
#include <stdio.h>
int Ack( int m, int n );
int main()
{
    int m, n;
    scanf("%d %d", &m, &n);
    printf("%d\n", Ack(m, n));
    return 0;
}
int Ack( int m, int n )
{
	if(m==0)
	return n+1;
	else if(n==0 && m>0)
	return Ack(m-1,1);
	else if(m>0 && n>0)
	return Ack(m-1,Ack(m,n-1));
}
