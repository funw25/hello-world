//函数定义：int prime( int p );int PrimeSum( int m, int n );
//其中函数prime当用户传入参数p为素数时返回1，否则返回0；
//函数PrimeSum返回区间[m, n]内所有素数的和。题目保证用户传入的参数m\le≤n。

#include <stdio.h>
#include <math.h>
int prime( int p );
int PrimeSum( int m, int n );
int main()
{
    int m, n, p;
    scanf("%d %d", &m, &n);
    printf("Sum of( ");
    for( p=m; p<=n; p++ ) {
        if( prime(p) != 0 )
            printf("%d ", p);
    }
    printf(")=%d\n", PrimeSum(m, n));
    return 0;
}
int prime( int p )
{
	if(p==1){
		return 0;
	}
	for(int i=2;i<p;i++){
		if(p%i==0){
			return 0;
		}
	}
	return 1;//!!!!!/ 循环结束后都没有找到能整除的数，说明是素数

}
int PrimeSum( int m, int n )
{
	int j,sum=0;
	for(j=m;j<=n;j++){
		if(prime(j)==1){
			sum+=j;
		}		
	}
	return sum;
}
