//本题要求实现一个判断整数n(n>=0，注意特殊值0的处理)是否为完全平方数的简单函数。
//int IsSquare( int n );
//其中n是用户传入的参数，在整型范围内。如果n是完全平方数，则函数IsSquare必须返回1，否则返回0。
//输入一个大于等于0的整数
//如果n是完全平方数，则输出YES，否则输出NO
//样例输入100
//样例输出YES

#include <stdio.h>
#include<math.h>
int IsSquare(int n);
int main(){
    int n;
    scanf("%d", &n);
    if (IsSquare(n)) {
        printf("YES\n");
    } else {
        printf("NO\n");
    }
}
int IsSquare(int n){
	if(n==0) return 1;
	int root=(int)sqrt(n);
	return (root*root==n)? 1:0;
}

