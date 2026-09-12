#include <stdio.h>
#include <string.h>

int main() {
    int N;
    scanf("%d", &N);

    char strings[N][80];
    int i;
    for (i = 0; i < N; i++) {
        scanf("%s", strings[i]);
    }

    int longestIndex = 0;
    int longestLength = strlen(strings[0]);
    for (i = 1; i < N; i++) {
        int currentLength = strlen(strings[i]);
        if (currentLength > longestLength) {
            longestLength = currentLength;
            longestIndex = i;
        }
    }

    printf("The longest is: %s", strings[longestIndex]);

    return 0;
}
